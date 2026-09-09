import { rateLimit } from "@/lib/http";
import { proposalPdf } from "@/lib/pdf";
import { readJson, sameOrigin } from "@/lib/server";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    rateLimit("pdf-global", 60);
    const bytes = await proposalPdf(await readJson(req, 150000));
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="proposal.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Invalid proposal or PDF generation failed" },
      { status: 400 },
    );
  }
}
