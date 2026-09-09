import Stripe from "stripe";
export const plans = {
  starter: { projects: 10, priceEnv: "STRIPE_PRICE_STARTER" },
  pro: { projects: 50, priceEnv: "STRIPE_PRICE_PRO" },
  studio: { projects: 200, priceEnv: "STRIPE_PRICE_STUDIO" },
} as const;
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Billing is not configured");
  return new Stripe(key);
}
export function hasPaidAccess(status: string) {
  return status === "active" || status === "trialing";
}
