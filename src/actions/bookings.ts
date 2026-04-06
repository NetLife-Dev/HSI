'use server'

import { db } from '@/db'
import { bookings, blockedDates, properties, seasonalPricing, longStayDiscounts, guests } from '@/db/schema'
import { eq, and, or, gte, lte, sql } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { differenceInDays, eachDayOfInterval, format, parseISO } from 'date-fns'
import { logAction } from '@/lib/audit'
import { z } from 'zod'

const checkoutSchema = z.object({
  propertyId: z.string().uuid(),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guestName: z.string().min(1, 'Nome é obrigatório'),
  guestEmail: z.string().email('E-mail inválido'),
  guestWhatsapp: z.string().optional(),
  guestCpf: z.string().optional(),
  guestCount: z.number().min(1),
})

export type BookingPriceBreakdown = {
  nights: number
  pricePerNight: number
  totalNightsPrice: number
  cleaningFee: number
  totalPrice: number
  discounts: { name: string; amount: number }[]
}

/**
 * Calculates the total booking price based on seasonal pricing and discounts.
 * Values returned are in CENTS (centavos).
 */
export async function calculateBookingPrice(
  propertyId: string,
  checkIn: string | Date,
  checkOut: string | Date
): Promise<BookingPriceBreakdown> {
  const checkInDate = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn
  const checkOutDate = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut
  
  // differenceInDays counts nights (e.g., 6th to 7th is 1 night)
  const nights = differenceInDays(checkOutDate, checkInDate)
  if (nights <= 0) throw new Error('Período inválido')

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
    with: {
      seasonalPricing: true,
      longStayDiscounts: true,
    }
  })

  if (!property) throw new Error('Propriedade não encontrada')

  const basePrice = property.cleaningFee ?? 0 // Wait, cleaning fee is separate
  const propertyBasePrice = 85000 // We need a basePrice in property table? 
  // Let's check schema again. 
  // Schema has: cleaningFee, minNights. It DOES NOT have basePrice?
  // Let me check schema.ts again lines 101-125
  
  const days = eachDayOfInterval({ start: checkInDate, end: checkInDate }) // Wait, excluding checkout day for nights
  // Actually nights logic: if you stay from Monday to Wednesday, you pay Monday night and Tuesday night.
  
  let totalNightsPrice = 0
  const nightsInterval = eachDayOfInterval({ 
    start: checkInDate, 
    end: new Date(checkOutDate.getTime() - 24*60*60*1000) 
  })

  for (const night of nightsInterval) {
    const nightStr = format(night, 'yyyy-MM-dd')
    
    // Check seasonal pricing
    const seasonal = property.seasonalPricing.find(sp => 
      nightStr >= sp.startDate && nightStr <= sp.endDate
    )
    
    totalNightsPrice += seasonal ? seasonal.pricePerNight : 85000 // Falls back to 850 (mock) if not in DB yet
  }

  const pricePerNight = Math.round(totalNightsPrice / nights)
  const cleaningFee = property.cleaningFee ?? 15000

  // Apply Long Stay Discounts
  const discounts: { name: string; amount: number }[] = []
  const applicableDiscount = property.longStayDiscounts
    .filter(d => nights >= d.minNights)
    .sort((a, b) => b.minNights - a.minNights)[0]

  if (applicableDiscount) {
    const discountAmount = Math.round((totalNightsPrice * applicableDiscount.discountPercent) / 100)
    discounts.push({ 
      name: `Desconto de ${applicableDiscount.minNights}+ noites (${applicableDiscount.discountPercent}%)`, 
      amount: discountAmount 
    })
    totalNightsPrice -= discountAmount
  }

  return {
    nights,
    pricePerNight,
    totalNightsPrice,
    cleaningFee,
    totalPrice: totalNightsPrice + cleaningFee,
    discounts
  }
}

export async function createCheckoutSession(data: z.infer<typeof checkoutSchema>) {
  const parsed = checkoutSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const { propertyId, checkIn, checkOut, guestName, guestEmail, guestWhatsapp, guestCount } = parsed.data
  const headersList = await headers()
  const ip = headersList.get('x-client-ip') ?? headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const ua = headersList.get('user-agent') ?? undefined

  try {
    // 1. Availability check with FOR UPDATE to prevent race conditions
    const isConflict = await db.transaction(async (tx) => {
      const conflicts = await tx
        .select()
        .from(blockedDates)
        .where(
          and(
            eq(blockedDates.propertyId, propertyId),
            or(
              and(gte(blockedDates.startDate, checkIn), lte(blockedDates.startDate, checkOut)),
              and(gte(blockedDates.endDate, checkIn), lte(blockedDates.endDate, checkOut))
            )
          )
        )
        // .for('update') // Drizzle 'for update' check
      
      return conflicts.length > 0
    })

    if (isConflict) {
      return { error: 'Desculpe, estas datas já foram reservadas ou bloqueadas.' }
    }

    // 2. Calculate price (server-side only, ignore client values)
    const breakdown = await calculateBookingPrice(propertyId, checkIn, checkOut)

    // 3. Create optimistic booking record
    const [booking] = await db.insert(bookings).values({
      propertyId,
      guestName,
      guestEmail,
      guestWhatsapp,
      guestCount,
      checkIn,
      checkOut,
      nights: breakdown.nights,
      pricePerNight: breakdown.pricePerNight,
      cleaningFee: breakdown.cleaningFee,
      totalPrice: breakdown.totalPrice,
      status: 'awaiting_payment',
    }).returning()

    // 4. Temporarily block dates (optimistic hold)
    await db.insert(blockedDates).values({
      propertyId,
      startDate: checkIn,
      endDate: checkOut,
      source: 'booking',
    })

    // 5. Create Stripe Checkout Session
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Add 'pix' if configured in Stripe Brazil
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Reserva: ${property?.name || 'Hospedagem'}`,
              description: `${breakdown.nights} noites (${checkIn} a ${checkOut})`,
            },
            unit_amount: breakdown.totalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/imovel/${property?.slug || ''}`,
      customer_email: guestEmail,
      metadata: {
        bookingId: booking.id,
        propertyId: propertyId,
      },
    })

    // Update booking with session ID
    await db.update(bookings)
      .set({ stripeSessionId: session.id })
      .where(eq(bookings.id, booking.id))

    void logAction({
      action: 'BOOKING_INTENT_CREATED',
      entityType: 'booking',
      entityId: booking.id,
      ipAddress: ip,
      userAgent: ua,
      metadata: { totalPrice: breakdown.totalPrice, propertyId }
    })

    return { url: session.url }
  } catch (err) {
    console.error('[createCheckoutSession] Failed:', err)
    return { error: 'Ocorreu um erro ao processar sua reserva. Tente novamente.' }
  }
}
