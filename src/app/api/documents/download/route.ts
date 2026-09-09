import { authenticated } from "@/lib/server";
import { z } from "zod";
export async function GET(req: Request) {
  try {
    const { db } = await authenticated();
    const id = z.string().uuid().parse(new URL(req.url).searchParams.get("id"));
    const { data: doc, error } = await db
      .from("documents")
      .select("path,mime_type,extension")
      .eq("id", id)
      .single();
    if (error || !doc) throw new Error("Not found");
    const { data, error: download } = await db.storage
      .from("bid-documents")
      .download(doc.path);
    if (download || !data) throw new Error("Not found");
    return new Response(data, {
      headers: {
        "Content-Type": doc.mime_type,
        "Content-Disposition": `attachment; filename="source-document.${doc.extension}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "Document unavailable" }, { status: 404 });
  }
}
