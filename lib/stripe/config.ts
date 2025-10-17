import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está definida')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

export const STRIPE_CONFIG = {
  priceIds: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY!,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY!,
  },
  prices: {
    monthly: 9.90,
    yearly: 95.00,
  },
  currency: 'eur',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
} as const