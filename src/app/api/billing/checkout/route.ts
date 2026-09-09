import { authenticated, readJson, sameOrigin } from "@/lib/server";
import { plans, stripeClient } from "@/lib/billing";
import { z } from "zod";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const { db, user } = await authenticated();
    const { organizationId, plan } = z
      .object({
        organizationId: z.string().uuid(),
        plan: z.enum(["starter", "pro", "studio"]),
      })
      .parse(await readJson(req, 1000));
    const { data: m } = await db
      .from("memberships")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();
    if (!m || !["owner", "administrator"].includes(m.role))
      throw new Error("Forbidden");
    const { data: subscription } = await db
      .from("subscriptions")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (subscription?.subscription_id)
      throw new Error("Use billing portal for existing subscriptions");
    const price = process.env[plans[plan].priceEnv];
    if (!price) throw new Error("Plan not configured");
    const stripe = stripeClient(),
      base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { data: attempt, error: reservationError } = await db.rpc(
      "reserve_checkout",
      { org: organizationId, requested_plan: plan },
    );
    if (reservationError || !attempt)
      throw new Error("Checkout reservation unavailable");
    const createdAt = Math.floor(new Date(attempt.createdAt).getTime() / 1000);
    // Stable request parameters match Stripe's idempotency contract for every retry.
    // After 60 minutes Stripe expires the session; the five-minute grace avoids overlaps.
    if (Date.now() / 1000 > createdAt + 3600)
      throw new Error("Checkout expired; wait five minutes and retry");
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        expires_at: createdAt + 3600,
        line_items: [{ price, quantity: 1 }],
        payment_method_collection: "always",
        client_reference_id: organizationId,
        metadata: { organization_id: organizationId, plan },
        subscription_data: {
          trial_period_days: 7,
          metadata: { organization_id: organizationId, plan },
        },
        success_url: `${base}/workspace?billing=returned`,
        cancel_url: `${base}/workspace`,
      },
      {
        idempotencyKey: `checkout:${organizationId}:${attempt.attemptId}`,
      },
    );
    return Response.json({ url: session.url });
  } catch {
    return Response.json(
      {
        error:
          "Checkout unavailable. Verify billing setup and owner permissions. A checkout already started for another plan must expire before switching; use the portal for existing subscriptions.",
      },
      { status: 400 },
    );
  }
}
