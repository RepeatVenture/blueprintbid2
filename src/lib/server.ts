import { boundedBody } from "./http";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Hosted accounts are not configured.");
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value, options }) =>
          jar.set(name, value, options),
        );
      },
    },
  });
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const expected = new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ).origin;
  if (origin !== expected) throw new Error("Invalid request origin");
}
export async function authenticated() {
  const db = await serverClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) throw new Error("Authentication required");
  return { db, user };
}
export async function readJson(req: Request, max = 2_000_000) {
  return JSON.parse(new TextDecoder().decode(await boundedBody(req, max)));
}
