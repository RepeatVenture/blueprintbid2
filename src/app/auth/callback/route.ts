import { serverClient } from "@/lib/server";
export async function GET(req: Request) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const code = new URL(req.url).searchParams.get("code");
    if (!code || code.length > 2000) throw new Error("Missing code");
    const db = await serverClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return Response.redirect(new URL("/account/password", base), 303);
  } catch {
    return Response.redirect(new URL("/login?recovery=failed", base), 303);
  }
}
