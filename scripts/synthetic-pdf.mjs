import { PDFDocument, StandardFonts } from "pdf-lib";
import { mkdir, writeFile } from "node:fs/promises";
const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const page = doc.addPage([612, 792]);
page.drawText("SYNTHETIC TEST DOCUMENT - NOT FOR CONSTRUCTION", {
  x: 40,
  y: 740,
  size: 16,
  font,
});
page.drawText("A-501 / Revision 1 / Room 101", {
  x: 40,
  y: 700,
  size: 14,
  font,
});
page.drawText(
  "Provide six base cabinets. Countertop finish requires approval.",
  { x: 40, y: 650, size: 12, font },
);
doc.addPage([612, 792]);
await mkdir("fixtures", { recursive: true });
await writeFile("fixtures/synthetic-millwork.pdf", await doc.save());
console.log(
  "Created fixtures/synthetic-millwork.pdf (native text + blank page for OCR review).",
);
