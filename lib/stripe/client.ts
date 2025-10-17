import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export const PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY!,
} as const;

export const PRICES = {
  monthly: 9.9,
  yearly: 95.0,
} as const;
