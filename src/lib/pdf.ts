import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { z } from "zod";
const text = z.string().max(2000);
export const proposalSchema = z.object({
  documentStatus: z.enum(["Issued", "Draft — not issued"]),
  version: z.number().int().positive(),
  issuedAt: z.string().max(100),
  company: text,
  project: text,
  client: text,
  address: text,
  scope: z
    .array(
      z.object({
        description: text,
        room: text,
        quantity: z.string().max(20),
        unit: z.string().max(30),
      }),
    )
    .max(300),
  commercial: z
    .array(
      z.object({
        kind: z.enum([
          "Allowance",
          "Add alternate",
          "Deduct alternate",
          "Unit price",
        ]),
        description: text,
        quantity: z.string().max(20),
        unit: z.string().max(30),
        price: z.string().regex(/^\d{1,20}\.\d{2}$/),
      }),
    )
    .max(100)
    .default([]),
  sellingPrice: z.string().regex(/^\d{1,20}\.\d{2}$/),
  qualifications: text,
  exclusions: text,
  terms: text,
  taxStatement: text,
});
export async function proposalPdf(input: unknown) {
  const p = proposalSchema.parse(input);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  let page = doc.addPage([612, 792]),
    y = 735;
  // Standard font is deliberately restricted: visible replacements prevent a crash on unsupported glyphs.
  const safe = (s: string) => s.replace(/[^\x20-\x7E\n]/g, "?");
  function line(text: string, size = 11) {
    const paragraphs = safe(text).split("\n");
    for (const paragraph of paragraphs) {
      let current = "";
      for (const word of paragraph.split(/\s+/)) {
        const chunks = word.match(/.{1,65}/g) || [""];
        for (const chunk of chunks) {
          const next = current ? `${current} ${chunk}` : chunk;
          if (font.widthOfTextAtSize(next, size) > 500 && current) {
            draw(current, size);
            current = chunk;
          } else current = next;
        }
      }
      draw(current, size);
    }
    y -= 7;
  }
  function draw(s: string, size: number) {
    if (y < 60) {
      page = doc.addPage([612, 792]);
      y = 735;
    }
    page.drawText(s, { x: 55, y, size, font, color: rgb(0.12, 0.19, 0.16) });
    y -= size + 6;
  }
  line(
    `${p.documentStatus.toUpperCase()} | PROPOSAL V${p.version} | ${p.issuedAt.slice(0, 10)}`,
    10,
  );
  line(p.company, 22);
  line(p.project, 16);
  line(`Prepared for ${p.client}`);
  line(p.address);
  line("INCLUDED SCOPE", 13);
  p.scope.forEach((s) =>
    line(`${s.quantity} ${s.unit} | ${s.room} | ${s.description}`),
  );
  line(`BASE BID: $${p.sellingPrice} USD`, 18);
  for (const item of p.commercial)
    line(
      `${item.kind}: ${item.description} | ${item.quantity} ${item.unit} | $${item.price}${item.kind === "Allowance" ? " (included in base bid)" : " (separate from base bid)"}`,
    );
  for (const [title, body] of [
    ["QUALIFICATIONS", p.qualifications],
    ["EXCLUSIONS", p.exclusions],
    ["TERMS", p.terms],
  ]) {
    line(title, 13);
    line(body);
  }
  line(p.taxStatement, 10);
  line("Accepted by: ________________________   Date: ______________");
  return doc.save();
}
