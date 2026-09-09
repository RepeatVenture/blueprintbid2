import { authenticated, readJson, sameOrigin } from "@/lib/server";
import { z } from "zod";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const { db } = await authenticated();
    const { name } = z
      .object({ name: z.string().trim().min(1).max(200) })
      .parse(await readJson(req, 1000));
    const { data, error } = await db.rpc("create_organization", {
      organization_name: name,
    });
    if (error) throw error;
    return Response.json({ id: data });
  } catch {
    return Response.json(
      { error: "Organization creation failed" },
      { status: 400 },
    );
  }
}
