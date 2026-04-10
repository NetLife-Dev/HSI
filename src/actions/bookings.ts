'use server'

import { db } from '@/db'
import { bookings, blockedDates, properties, seasonalPricing, longStayDiscounts, guests, coupons, propertyServices } from '@/db/schema'
import { eq, and, or, gte, lte } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
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
  selectedServiceIds: z.array(z.string()).default([]),
  couponCode: z.string().optional(),
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
 * Calculates the total booking price based on seasonal pricing and long-stay discounts.
 * Values returned are in CENTS (centavos).
 * Note: does NOT include services or coupons — those are handled at checkout.
 */
export async function calculateBookingPrice(
  propertyId: string,
  checkIn: string | Date,
  checkOut: string | Date
): Promise<BookingPriceBreakdown> {
  const checkInDate = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn
  const checkOutDate = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut

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

  // Use the property's actual basePrice as the default per-night rate
  const propertyBasePrice = property.basePrice

  let totalNightsPrice = 0
  const nightsInterval = eachDayOfInterval({
    start: checkInDate,
    end: new Date(checkOutDate.getTime() - 24 * 60 * 60 * 1000)
  })

  for (const night of nightsInterval) {
    const nightStr = format(night, 'yyyy-MM-dd')
    const seasonal = property.seasonalPricing.find(sp =>
      nightStr >= sp.startDate && nightStr <= sp.endDate
    )
    // Use seasonal price if available, otherwise fall back to property's base price
    totalNightsPrice += seasonal ? seasonal.pricePerNight : propertyBasePrice
  }

  const pricePerNight = Math.round(totalNightsPrice / nights)
  const cleaningFee = property.cleaningFee ?? 0

  // Apply long-stay discounts (best applicable tier wins)
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

  if (!stripe) {
    return { error: 'Pagamento via Stripe não configurado. Chave STRIPE_SECRET_KEY ausente.' }
  }

  const { propertyId, checkIn, checkOut, guestName, guestEmail, guestWhatsapp, guestCpf, guestCount, selectedServiceIds, couponCode } = parsed.data
  const headersList = await headers()
  const ip = headersList.get('x-client-ip') ?? headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const ua = headersList.get('user-agent') ?? null

  try {
    // 1. Availability check
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
      return conflicts.length > 0
    })

    if (isConflict) {
      return { error: 'Desculpe, estas datas já foram reservadas ou bloqueadas.' }
    }

    // 2. Calculate accommodation price server-side (single source of truth)
    const breakdown = await calculateBookingPrice(propertyId, checkIn, checkOut)

    // 3. Load selected services
    const nights = breakdown.nights
    let servicesTotal = 0
    const serviceLineItems: any[] = []
    if (selectedServiceIds.length > 0) {
      const services = await db.query.propertyServices.findMany({
        where: eq(propertyServices.propertyId, propertyId),
      })
      const selected = services.filter(s => selectedServiceIds.includes(s.id))
      for (const s of selected) {
        let qty = 1
        if (s.unit === 'per_day' || s.unit === 'per_night') qty = nights
        if (s.unit === 'per_guest') qty = guestCount
        const lineTotal = s.price * qty
        servicesTotal += lineTotal
        serviceLineItems.push({
          price_data: {
            currency: 'brl',
            product_data: { name: s.name },
            unit_amount: s.price,
          },
          quantity: qty,
        })
      }
    }

    // 4. Validate coupon
    let stripeCouponId: string | undefined
    let couponId: string | undefined
    if (couponCode) {
      const couponRec = await db.query.coupons.findFirst({
        where: eq(coupons.code, couponCode.toUpperCase()),
      })
      if (!couponRec) {
        return { error: 'Cupom não encontrado.' }
      }
      if (!couponRec.isActive) {
        return { error: 'Este cupom não está ativo.' }
      }
      if (couponRec.validUntil && new Date(couponRec.validUntil) < new Date()) {
        return { error: 'Este cupom está expirado.' }
      }
      if (couponRec.maxUses && couponRec.usedCount >= couponRec.maxUses) {
        return { error: 'Este cupom atingiu o limite de usos.' }
      }
      if (!couponRec.stripeCouponId) {
        return { error: 'Cupom não sincronizado com Stripe. Contate o suporte.' }
      }
      stripeCouponId = couponRec.stripeCouponId
      couponId = couponRec.id
    }

    const grandTotal = breakdown.totalPrice + servicesTotal

    // 5. Create optimistic booking record
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
      totalPrice: grandTotal,
      status: 'awaiting_payment',
      couponId: couponId ?? null,
      selectedServices: serviceLineItems.map(l => ({
        name: l.price_data.product_data.name,
        price: l.price_data.unit_amount,
        qty: l.quantity,
      })),
    }).returning()

    if (!booking) throw new Error('Falha ao criar reserva')

    // 6. Temporarily block dates
    await db.insert(blockedDates).values({
      propertyId,
      startDate: checkIn,
      endDate: checkOut,
      source: 'booking',
    })

    // 7. Build Stripe line items — per-night pricing for clarity
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    })

    const stripeLineItems: any[] = [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: `${property?.name || 'Hospedagem'} — ${breakdown.nights} noite${breakdown.nights > 1 ? 's' : ''}`,
            description: `Check-in: ${checkIn} | Check-out: ${checkOut}`,
          },
          unit_amount: breakdown.pricePerNight,
        },
        quantity: breakdown.nights,
      },
      {
        price_data: {
          currency: 'brl',
          product_data: { name: 'Taxa de Limpeza' },
          unit_amount: breakdown.cleaningFee,
        },
        quantity: 1,
      },
      ...serviceLineItems,
    ]

    // Apply long-stay discounts as negative line items (Stripe doesn't support discounts on line items natively)
    for (const discount of breakdown.discounts) {
      stripeLineItems.push({
        price_data: {
          currency: 'brl',
          product_data: { name: discount.name },
          unit_amount: -discount.amount,
        },
        quantity: 1,
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${appUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/imovel/${property?.slug || ''}`,
      customer_email: guestEmail,
      discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
      metadata: {
        bookingId: booking.id,
        propertyId,
      },
    })

    // 8. Update booking with session ID
    await db.update(bookings)
      .set({ stripeSessionId: session.id })
      .where(eq(bookings.id, booking.id))

    void logAction({
      action: 'BOOKING_INTENT_CREATED',
      entityType: 'booking',
      entityId: booking.id,
      ipAddress: ip,
      userAgent: ua,
      metadata: { totalPrice: grandTotal, propertyId }
    })

    return { url: session.url }
  } catch (err: any) {
    console.error('[createCheckoutSession] Failed:', err)
    const message = err?.message || ''
    if (message.includes('No such coupon')) return { error: 'Cupom Stripe inválido. Contate o suporte.' }
    if (message.includes('Invalid API Key')) return { error: 'Chave Stripe inválida. Verifique STRIPE_SECRET_KEY.' }
    if (message.includes('rate limit')) return { error: 'Muitas tentativas. Aguarde alguns instantes.' }
    return { error: 'Erro ao processar reserva. Tente novamente.' }
  }
}
