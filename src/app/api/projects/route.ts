import { logEvent } from "@/lib/logging";
import { authenticated, readJson, sameOrigin } from "@/lib/server";
import { projectSchema } from "@/lib/model";
import { calculate, customerProposal, warnings } from "@/lib/estimate";
import { z } from "zod";
export async function GET(req: Request) {
  try {
    const { db } = await authenticated();
    const { data: organizations, error } = await db
      .from("organizations")
      .select("id,name");
    if (error) throw error;
    const org =
      new URL(req.url).searchParams.get("organizationId") ||
      organizations?.[0]?.id;
    const { data: projects, error: pe } = org
      ? await db.from("projects").select("data").eq("organization_id", org)
      : { data: [], error: null };
    if (pe) throw pe;
    return Response.json(
      { organizations, projects },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    logEvent("project_request_failed", { outcome: "failed" });
    return Response.json(
      { error: "Authentication or configuration required" },
      { status: 401 },
    );
  }
}
async function write(req: Request, create: boolean) {
  try {
    sameOrigin(req);
    const { db } = await authenticated();
    const { organizationId, project } = z
      .object({ organizationId: z.string().uuid(), project: projectSchema })
      .parse(await readJson(req));
    z.string().uuid().parse(project.id);
    calculate(project);
    // New snapshots must be generated from the current validated estimate; existing snapshots are immutable in SQL.
    const { data: existing } = await db
      .from("projects")
      .select("data")
      .eq("id", project.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    const count = existing?.data?.proposals?.length || 0;
    if (project.proposals.length > count + 1)
      throw new Error("Issue one version at a time");
    if (project.proposals.length > count) {
      if (warnings(project).length)
        throw new Error("Unresolved proposal checks");
      const v = project.proposals[count];
      project.proposals[count] = {
        ...v,
        snapshot: JSON.stringify(
          customerProposal(project, count + 1, v.issuedAt, true),
        ),
      };
    }
    const result = create
      ? await db.from("projects").insert({
          id: project.id,
          organization_id: organizationId,
          data: project,
        })
      : await db
          .from("projects")
          .update({ data: project })
          .eq("id", project.id)
          .eq("organization_id", organizationId)
          .select("data");
    if (result.error || (!create && !result.data?.length))
      throw new Error("Write failed");
    return Response.json({
      ok: true,
      project: create ? project : result.data?.[0]?.data,
    });
  } catch {
    logEvent("project_request_failed", { outcome: "failed" });
    return Response.json(
      { error: "Project validation or authorization failed" },
      { status: 400 },
    );
  }
}
export const POST = (req: Request) => write(req, true);
export const PUT = (req: Request) => write(req, false);
