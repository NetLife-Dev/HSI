import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('STRIPE_SECRET_KEY is missing in environment variables.')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia', // Latest stable API version as of early 2025
  typescript: true,
})
