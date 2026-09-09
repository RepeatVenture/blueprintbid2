import { authenticated, readJson, sameOrigin } from "@/lib/server";
import { scopeSchema } from "@/lib/model";
import { z } from "zod";
export async function GET(req: Request) {
  try {
    const { db } = await authenticated();
    const org = z
      .string()
      .uuid()
      .parse(new URL(req.url).searchParams.get("organizationId"));
    const { data, error } = await db
      .from("catalogs")
      .select("*")
      .eq("organization_id", org)
      .eq("kind", "assembly")
      .order("version", { ascending: false });
    if (error) throw error;
    return Response.json(
      { catalogs: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Catalog unavailable" }, { status: 400 });
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const { db } = await authenticated();
    const { organizationId, scope } = z
      .object({ organizationId: z.string().uuid(), scope: scopeSchema })
      .parse(await readJson(req, 100000));
    const { data: latest, error } = await db
      .from("catalogs")
      .select("version")
      .eq("organization_id", organizationId)
      .eq("name", scope.description)
      .order("version", { ascending: false })
      .limit(1);
    if (error) throw error;
    const { error: write } = await db.from("catalogs").insert({
      organization_id: organizationId,
      name: scope.description,
      kind: "assembly",
      version: (latest?.[0]?.version || 0) + 1,
      data: {
        ...scope,
        source: "",
        evidence: "",
        notes: "",
        room: "",
        status: "Needs review",
        responsibility: "Unknown",
      },
    });
    if (write) throw write;
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        error:
          "Catalog save failed. Check permissions or retry if another editor saved this name.",
      },
      { status: 400 },
    );
  }
}
