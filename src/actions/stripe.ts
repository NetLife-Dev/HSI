'use server'

import { stripe } from '@/lib/stripe'
import { db } from '@/db/index'
import { properties, bookings, coupons } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

interface CheckoutParams {
  propertyId: string
  checkin: string
  checkout: string
  guests: number
  userId?: string
  guestName: string
  guestEmail: string
  guestWhatsapp?: string
  selectedServiceIds: string[]
  couponCode?: string
}

export async function createCheckoutSession(params: CheckoutParams) {
  const { propertyId, checkin, checkout, guests, guestName, guestEmail, selectedServiceIds, couponCode } = params
  
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
    with: {
      services: true,
      seasonalPricing: true,
    }
  })

  if (!property) throw new Error('Propriedade não encontrada')

  // Calculate prices (Simplified for UAT)
  const nights = Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24))
  const totalAccommodation = property.basePrice * nights
  const cleaningFee = property.cleaningFee
  
  const selectedServices = (property.services || []).filter(s => selectedServiceIds.includes(s.id))
  const servicesTotal = selectedServices.reduce((acc, s) => {
    if (s.unit === 'per_day') return acc + (s.price * nights)
    if (s.unit === 'per_guest') return acc + (s.price * guests)
    return acc + s.price
  }, 0)

  const line_items: any[] = [
    {
      price_data: {
        currency: 'brl',
        product_data: {
          name: `${property.name} (${nights} noites)`,
          description: `Check-in: ${checkin} | Check-out: ${checkout}`,
        },
        unit_amount: totalAccommodation,
      },
      quantity: 1,
    },
    {
      price_data: {
        currency: 'brl',
        product_data: {
          name: 'Taxa de Limpeza',
        },
        unit_amount: cleaningFee,
      },
      quantity: 1,
    }
  ]

  // Add services to line items
  selectedServices.forEach(s => {
    let amount = s.price
    let qty = 1
    if (s.unit === 'per_day') qty = nights
    if (s.unit === 'per_guest') qty = guests

    line_items.push({
      price_data: {
        currency: 'brl',
        product_data: {
          name: s.name,
        },
        unit_amount: amount,
      },
      quantity: qty,
    })
  })

  const origin = (await headers()).get('origin')

  // Validate coupon
  let discounts: any[] = []
  if (couponCode) {
    const couponRec = await db.query.coupons.findFirst({
      where: eq(coupons.code, couponCode.toUpperCase()),
    })
    if (couponRec && couponRec.isActive && couponRec.stripeCouponId) {
      discounts = [{ coupon: couponRec.stripeCouponId }]
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    customer_email: guestEmail,
    discounts,
    success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/imovel/${property.slug}`,
    metadata: {
      propertyId,
      checkin,
      checkout,
      guests: guests.toString(),
      guestName,
      guestEmail,
      selectedServiceIds: selectedServiceIds.join(','),
    },
  })

  if (!session.url) throw new Error('Não foi possível gerar sessão de checkout')

  return { url: session.url }
}
