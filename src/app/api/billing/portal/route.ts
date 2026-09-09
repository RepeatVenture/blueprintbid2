import { authenticated, readJson, sameOrigin } from "@/lib/server";
import { stripeClient } from "@/lib/billing";
import { z } from "zod";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const { db, user } = await authenticated();
    const { organizationId } = z
      .object({ organizationId: z.string().uuid() })
      .parse(await readJson(req, 1000));
    const { data: m } = await db
      .from("memberships")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();
    if (!m || !["owner", "administrator"].includes(m.role))
      throw new Error("Forbidden");
    const { data: sub } = await db
      .from("subscriptions")
      .select("customer_id")
      .eq("organization_id", organizationId)
      .single();
    if (!sub?.customer_id) throw new Error("No billing account");
    const session = await stripeClient().billingPortal.sessions.create({
      customer: sub.customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/workspace`,
    });
    return Response.json({ url: session.url });
  } catch {
    return Response.json(
      {
        error:
          "Billing portal unavailable. Verify subscription and owner permissions.",
      },
      { status: 400 },
    );
  }
}
