'use server'

import { db } from '@/db/index'
import { coupons } from '@/db/schema'
import { stripe } from '@/lib/stripe'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

interface CouponInput {
  code: string
  discountPercent?: number
  discountAmount?: number
  maxUses?: number
  validUntil?: string
  isActive?: boolean
}

export async function createCoupon(data: CouponInput) {
  try {
    const { code, discountPercent, discountAmount, maxUses, validUntil, isActive = true } = data
    
    // 1. Create on Stripe
    let stripeCouponId: string | undefined = undefined
    if (stripe) {
      const stripeCoupon = await stripe.coupons.create({
        name: code,
        percent_off: discountPercent || undefined,
        amount_off: discountAmount || undefined,
        currency: discountAmount ? 'brl' : undefined,
        duration: 'once',
        max_redemptions: maxUses || undefined,
        redeem_by: validUntil ? Math.floor(new Date(validUntil).getTime() / 1000) : undefined,
      })
      stripeCouponId = stripeCoupon.id
    }

    // 2. Save to DB
    const newCoupon = await db.insert(coupons).values({
      code: code.toUpperCase(),
      discountPercent,
      discountAmount,
      maxUses,
      validUntil,
      isActive,
      stripeCouponId,
    }).returning()

    revalidatePath('/admin/cupons')
    return { success: true, coupon: newCoupon[0] }
  } catch (error: any) {
    console.error('Error creating coupon:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteCoupon(id: string) {
  try {
    // We don't necessarily delete on Stripe to keep logs, but we can deactivate in DB
    await db.update(coupons).set({ isActive: false }).where(eq(coupons.id, id))
    revalidatePath('/admin/cupons')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCoupons() {
  return db.query.coupons.findMany({
    orderBy: (coupons, { desc }) => [desc(coupons.createdAt)],
  })
}
