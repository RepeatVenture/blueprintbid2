import { logEvent } from "@/lib/logging";
import { boundedBody, rateLimit } from "@/lib/http";
import { authenticated, sameOrigin } from "@/lib/server";
import { validateDocument, MAX_PDF_BYTES } from "@/lib/documents";
import { z } from "zod";
export async function GET(req: Request) {
  try {
    const { db } = await authenticated();
    const projectId = z
      .string()
      .uuid()
      .parse(new URL(req.url).searchParams.get("projectId"));
    const { data, error } = await db
      .from("documents")
      .select(
        "id,name,version,category,status,created_at,processing_error,extraction,mime_type",
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json(
      { documents: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    logEvent("document_request_failed", { outcome: "failed" });
    return Response.json(
      { error: "Unable to load documents" },
      { status: 400 },
    );
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    if (Number(req.headers.get("content-length")) > MAX_PDF_BYTES + 10000)
      throw new Error("Too large");
    const { db, user } = await authenticated();
    rateLimit(`upload:${user.id}`, 10);
    const bounded = await boundedBody(req, MAX_PDF_BYTES + 10000);
    const form = await new Response(Buffer.from(bounded), {
      headers: { "Content-Type": req.headers.get("content-type") || "" },
    }).formData();
    const projectId = z.string().uuid().parse(form.get("projectId"));
    const organizationId = z.string().uuid().parse(form.get("organizationId"));
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("Missing PDF");
    if (file.size > MAX_PDF_BYTES) throw new Error("Too large");
    const version = z.coerce
      .number()
      .int()
      .positive()
      .max(10000)
      .parse(form.get("version"));
    const category = z
      .enum(["Drawings", "Specifications", "Addendum", "Vendor quote", "Other"])
      .parse(form.get("category"));
    const bytes = new Uint8Array(await file.arrayBuffer());
    const format = validateDocument(bytes, file.name, file.type);
    const id = crypto.randomUUID(),
      path = `${organizationId}/${projectId}/${id}.${format.extension}`;
    const { data: project } = await db
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("organization_id", organizationId)
      .single();
    if (!project) throw new Error("Unknown project");
    const { error: upload } = await db.storage
      .from("bid-documents")
      .upload(path, bytes, { contentType: format.mime, upsert: false });
    if (upload) throw upload;
    const { error } = await db.from("documents").insert({
      id,
      organization_id: organizationId,
      project_id: projectId,
      name: file.name.slice(0, 200),
      path,
      mime_type: format.mime,
      extension: format.extension,
      version,
      category,
      uploaded_by: user.id,
      status: "Uploaded — not processed",
    });
    if (error) {
      await db.storage.from("bid-documents").remove([path]);
      throw error;
    }
    return Response.json({ id });
  } catch {
    logEvent("document_request_failed", { outcome: "failed" });
    return Response.json(
      {
        error:
          "Upload failed. Only PDF, PNG and JPEG files up to 20 MiB are accepted; editor membership is required.",
      },
      { status: 400 },
    );
  }
}
