import { authenticated, readJson, sameOrigin } from "@/lib/server";
import { nativeProvider } from "@/lib/native-pdf";
import { z } from "zod";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: Request) {
  let failedDocument: string | undefined;
  try {
    sameOrigin(req);
    const { db } = await authenticated();
    const { id } = z
      .object({ id: z.string().uuid() })
      .parse(await readJson(req, 1000));
    const { data: d, error } = await db
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !d || d.mime_type !== "application/pdf")
      throw new Error("Document unavailable");
    const { data: claimed } = await db.rpc("claim_document", { doc_id: id });
    if (!claimed?.length)
      throw new Error("Already processing or permission denied");
    failedDocument = id;
    const started = Date.now();
    const { data: file, error: download } = await db.storage
      .from("bid-documents")
      .download(d.path);
    if (download || !file) throw new Error("Stored document unavailable");
    const extraction = await nativeProvider.extract(
      new Uint8Array(await file.arrayBuffer()),
    );
    const status = extraction.warnings.length
      ? "Needs OCR / manual review"
      : "Native text extracted — needs review";
    const { error: update } = await db
      .from("documents")
      .update({
        status,
        extraction: {
          ...d.extraction,
          ...extraction,
          method: "native-text-keyword-v1",
        },
        processing_error: null,
      })
      .eq("id", id);
    if (update) throw update;
    await db.from("processing_runs").insert({
      organization_id: d.organization_id,
      project_id: d.project_id,
      document_id: id,
      provider: "pdfjs-native",
      template_version: "keyword-v1",
      status,
      pages: extraction.pages,
      latency_ms: Date.now() - started,
      estimated_cost: 0,
    });
    return Response.json({
      message: `${extraction.pages} pages examined; ${extraction.candidates.length} review candidates. ${extraction.warnings.length ? "OCR is required for some pages." : "Verify against original drawings."}`,
    });
  } catch {
    if (failedDocument) {
      try {
        const { db } = await authenticated();
        await db
          .from("documents")
          .update({
            status: "Failed — retry available",
            processing_error:
              "Native extraction failed. The PDF may be encrypted, malformed, too large, or require OCR. Split to 100 pages or fewer and retry.",
          })
          .eq("id", failedDocument);
      } catch {}
    }
    return Response.json(
      {
        error:
          "Processing unavailable or failed. Check document status, permissions, and PDF limits.",
      },
      { status: 400 },
    );
  }
}
