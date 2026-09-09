import { authenticated, sameOrigin, readJson } from "@/lib/server";
import { z } from "zod";
export async function GET(req: Request) {
  try {
    const { db } = await authenticated();
    const org = z
      .string()
      .uuid()
      .parse(new URL(req.url).searchParams.get("organizationId"));
    const { data, error } = await db.rpc("member_directory", { org });
    if (error) throw error;
    return Response.json(
      { members: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Member directory requires owner/admin access." },
      { status: 403 },
    );
  }
}
export async function DELETE(req: Request) {
  try {
    sameOrigin(req);
    const { db } = await authenticated();
    const { organizationId, userId } = z
      .object({ organizationId: z.string().uuid(), userId: z.string().uuid() })
      .parse(await readJson(req, 1000));
    const { error } = await db.rpc("revoke_member", {
      org: organizationId,
      target_user: userId,
    });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        error:
          "Member could not be removed. Owners cannot be removed and you cannot remove yourself.",
      },
      { status: 403 },
    );
  }
}
