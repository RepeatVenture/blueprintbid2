import { authenticated, readJson, sameOrigin } from "@/lib/server";
import { z } from "zod";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const { db } = await authenticated();
    const body = await readJson(req, 2000);
    if (body.token) {
      const token = z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .parse(body.token);
      const { data, error } = await db.rpc("accept_invitation", {
        invite_token: token,
      });
      if (error) throw error;
      return Response.json({ organizationId: data });
    }
    const { organizationId, email, role } = z
      .object({
        organizationId: z.string().uuid(),
        email: z.email(),
        role: z.enum([
          "administrator",
          "estimator",
          "project_manager",
          "draftsperson",
          "viewer",
        ]),
      })
      .parse(body);
    const { data, error } = await db.rpc("create_invitation", {
      org: organizationId,
      invite_email: email,
      invite_role: role,
    });
    if (error) throw error;
    return Response.json(
      { token: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        error:
          "Invitation failed. Verify permissions, confirmed email, token and expiry.",
      },
      { status: 400 },
    );
  }
}
