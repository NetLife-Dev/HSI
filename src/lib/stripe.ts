import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ STRIPE_SECRET_KEY não encontrada em produção. O checkout não funcionará.')
}

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27-acacia' as any,
      typescript: true,
    })
  : (null as any) // Stub para evitar erro de inicialização síncrona
