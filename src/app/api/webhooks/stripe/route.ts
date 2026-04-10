import { stripe } from '@/lib/stripe'
import { db } from '@/db'
import { bookings, blockedDates, processedWebhookEvents, guests, financialTransactions, properties } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { BookingConfirmation } from '@/emails/BookingConfirmation'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  let event

  try {
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new NextResponse('Webhook secret missing', { status: 400 })
    }
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Idempotency check: prevent double processing (duplicate webhooks)
  const [existing] = await db
    .select()
    .from(processedWebhookEvents)
    .where(eq(processedWebhookEvents.stripeEventId, event.id))
    .limit(1)

  if (existing) {
    return new NextResponse('Event already processed', { status: 200 })
  }

  // Track event as processed immediately
  await db.insert(processedWebhookEvents).values({
    stripeEventId: event.id,
    processedAt: new Date(),
  })

  // Handle events
  const session = event.data.object as any

  switch (event.type) {
    case 'checkout.session.completed': {
      const bookingId = session.metadata?.bookingId
      if (!bookingId) break

      const [booking] = await db
        .update(bookings)
        .set({
          status: 'confirmed',
          stripePaymentIntentId: session.payment_intent as string,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId))
        .returning()

      if (booking) {
        // 1. Get/Create Guest in CRM
        let [guest] = await db
          .select()
          .from(guests)
          .where(eq(guests.email, booking.guestEmail))
          .limit(1)

        if (!guest) {
          [guest] = await db.insert(guests).values({
            name: booking.guestName,
            email: booking.guestEmail,
            phone: booking.guestWhatsapp,
          }).returning()
        }

        if (booking && guest) {
          // Link booking to guest
          await db.update(bookings).set({ guestId: guest.id }).where(eq(bookings.id, booking.id))

          // 2. Financial Entry
          await db.insert(financialTransactions).values({
            bookingId: booking.id as string,
            type: 'income',
            amount: booking.totalPrice,
            category: 'booking_income',
            description: `Reserva #${booking.id.substring(0, 8)} - ${booking.guestName}`,
            date: new Date().toISOString().split('T')[0],
          })
        }

        // 3. Get Property for Email
        const property = await db.query.properties.findFirst({
          where: eq(properties.id, booking.propertyId)
        })

        // 4. Send Confirmation Email (Async)
        if (guest) {
           try {
             await sendEmail({
               to: guest.email!,
               subject: `Reserva Confirmada: ${property?.name || 'Sua Hospedagem'}`,
               react: BookingConfirmation({
                 guestName: guest.name,
                 propertyName: property?.name || 'Sua Hospedagem',
                 checkIn: booking.checkIn,
                 checkOut: booking.checkOut,
                 totalPrice: booking.totalPrice,
                 bookingId: booking.id as string,
               })
             })
           } catch (emailErr) {
             console.error('Failed to send confirmation email:', emailErr)
           }
        }
      }
      break
    }

    case 'checkout.session.expired': {
      const bookingId = session.metadata?.bookingId
      if (!bookingId) break

      const [booking] = await db
        .update(bookings)
        .set({ status: 'canceled' })
        .where(eq(bookings.id, bookingId))
        .returning()

      if (booking) {
        // Release blocked dates
        await db.delete(blockedDates)
          .where(
            and(
              eq(blockedDates.propertyId, booking.propertyId),
              eq(blockedDates.startDate, booking.checkIn),
              eq(blockedDates.endDate, booking.checkOut),
              eq(blockedDates.source, 'booking')
            )
          )
      }
      break
    }
  }

  return new NextResponse('Webhook processed', { status: 200 })
}
