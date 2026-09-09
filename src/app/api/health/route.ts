export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "blueprintbid",
      hostedConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ),
      billingConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
