import { authenticated, readJson, sameOrigin } from "@/lib/server";
import { analyzeVisual, visionConfig, focusSchema } from "@/lib/vision";
import { validateDocument } from "@/lib/documents";
import { z } from "zod";
export const runtime = "nodejs";
export const maxDuration = 180;
export function GET() {
  return Response.json(
    {
      enabled:
        process.env.VISION_ENABLED === "true" &&
        !!process.env.OPENAI_API_KEY &&
        !!process.env.OPENAI_VISION_MODEL,
      dailyCallLimit: 25,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: Request) {
  let docId: string | undefined, runId: string | undefined;
  const started = Date.now();
  try {
    sameOrigin(req);
    const { db } = await authenticated();
    const config = visionConfig();
    const { id, page, consent, focus } = z
      .object({
        id: z.string().uuid(),
        page: z.number().int().min(1).max(2000),
        consent: z.literal(true),
        focus: focusSchema.optional(),
      })
      .parse(await readJson(req, 20000));
    if (!consent) throw new Error("Consent required");
    const { data: d, error } = await db
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !d) throw new Error("Unavailable");
    const { data: claim } = await db.rpc("claim_document", { doc_id: id });
    if (!claim?.length) throw new Error("Document is busy");
    docId = id;
    const { data: file, error: download } = await db.storage
      .from("bid-documents")
      .download(d.path);
    if (download || !file) throw new Error("Source unavailable");
    const bytes = new Uint8Array(await file.arrayBuffer());
    validateDocument(bytes, d.name, d.mime_type);
    const { data: reservation, error: budget } = await db.rpc(
      "reserve_visual_call",
      { doc_id: id },
    );
    if (budget || !reservation)
      throw new Error("Daily visual analysis limit or permissions");
    runId = reservation;
    const result = await analyzeVisual(
      bytes,
      d.mime_type,
      page,
      config,
      fetch,
      focus,
    );
    const history = Array.isArray(d.extraction?.visualPages)
      ? d.extraction.visualPages
      : [];
    const visualPages = [
      ...history.filter(
        (r: {
          page: number;
          focus?: { room?: string; detail?: string } | null;
        }) =>
          r.page !== page ||
          (r.focus?.room || "") !== (focus?.room || "") ||
          (r.focus?.detail || "") !== (focus?.detail || ""),
      ),
      { page, ...result, processedAt: new Date().toISOString() },
    ];
    const { error: record } = await db
      .from("processing_runs")
      .update({
        status: "Completed — needs review",
        template_version: result.promptVersion,
        latency_ms: Date.now() - started,
        details: { page, ...result },
      })
      .eq("id", runId);
    if (record) throw record;
    const { error: save } = await db
      .from("documents")
      .update({
        status: "Visual page analyzed — needs review",
        processing_error: null,
        extraction: { ...(d.extraction || {}), visualPages },
      })
      .eq("id", id);
    if (save) throw save;
    return Response.json({
      message: `Page ${page} analyzed: ${result.result.items.length} proposed scope items. Review counts, dimensions, evidence and omissions against the original. Other pages have not been reviewed.`,
    });
  } catch {
    try {
      const { db } = await authenticated();
      if (docId)
        await db
          .from("documents")
          .update({
            status: "Visual analysis failed — retry available",
            processing_error:
              "No visual result was accepted. Check configuration, page number, daily limit, provider access and document quality. A timed-out provider call may still incur usage.",
          })
          .eq("id", docId);
      if (runId)
        await db
          .from("processing_runs")
          .update({
            status: "Failed or timed out",
            latency_ms: Date.now() - started,
          })
          .eq("id", runId);
    } catch {}
    return Response.json(
      {
        error:
          "Visual analysis unavailable or failed. No new candidates were accepted. Check provider setup, editor access, page number, daily limit and document status.",
      },
      { status: 400 },
    );
  }
}
