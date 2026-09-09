import { logEvent } from "@/lib/logging";
import { boundedBody } from "@/lib/http";
import { stripeClient, plans } from "@/lib/billing";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET,
      url = process.env.NEXT_PUBLIC_SUPABASE_URL,
      key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret || !url || !key)
      return Response.json(
        { error: "Webhook not configured" },
        { status: 503 },
      );
    const stripe = stripeClient();
    const body = new TextDecoder().decode(await boundedBody(req, 1000000));
    if (body.length > 1000000) return new Response(null, { status: 413 });
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        req.headers.get("stripe-signature") || "",
        secret,
      );
    } catch {
      logEvent("billing_webhook_failed", { outcome: "failed" });
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }
    if (
      ![
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
      ].includes(event.type)
    )
      return Response.json({ received: true, ignored: true });
    const eventSub = event.data.object as import("stripe").Stripe.Subscription;
    // Retrieve current state so delayed deliveries do not blindly apply the old event payload.
    const sub = await stripe.subscriptions.retrieve(eventSub.id);
    const organizationId = z
      .string()
      .uuid()
      .parse(sub.metadata.organization_id);
    const price = sub.items.data[0]?.price.id;
    const plan = (Object.keys(plans) as (keyof typeof plans)[]).find(
      (p) => process.env[plans[p].priceEnv] === price,
    );
    if (!plan) throw new Error("Unknown price");
    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await db.rpc("apply_billing_event", {
      event_id: event.id,
      event_created: event.created,
      org_id: organizationId,
      stripe_customer:
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripe_subscription: sub.id,
      plan_name: plan,
      subscription_status: sub.status,
    });
    if (error) throw error;
    return Response.json({ received: true });
  } catch {
    logEvent("billing_webhook_failed", { outcome: "failed" });
    return Response.json(
      { error: "Webhook processing failed; delivery can be retried" },
      { status: 500 },
    );
  }
}
