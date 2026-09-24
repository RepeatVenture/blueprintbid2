import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  INDEX_VERSION,
  indexPage,
  linkPages,
} from "../src/lib/document-index.ts";
const args = process.argv.slice(2);
const output = args.shift();
if (!output || !args.length)
  throw new Error(
    "Usage: npm run documents:index -- OUTPUT_DIR INPUT.pdf [INPUT.pdf ...]. Pass drawings/specs only; keep reference answers separate.",
  );
await fs.mkdir(output, { recursive: true, mode: 0o700 });
const documents = [];
const pages = [];
async function save(file, value) {
  const temp = `${file}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2), { mode: 0o600 });
  await fs.rename(temp, file);
}
for (const file of args) {
  const info = await fs.stat(file);
  if (info.size > 150 * 1024 * 1024)
    throw new Error("Local indexing limit is 150 MiB per document");
  const bytes = await fs.readFile(file);
  const hash = createHash("sha256").update(bytes).digest("hex");
  const directory = path.join(output, hash);
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const task = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: true,
    disableFontFace: true,
  });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 2000)
      throw new Error("Local indexing limit is 2,000 pages per document");
    const record = {
      document: hash,
      name: path.basename(file),
      bytes: bytes.length,
      pages: pdf.numPages,
      method: INDEX_VERSION,
      status: "Indexing",
      completedPages: 0,
    };
    await save(path.join(directory, "status.json"), record);
    for (let n = 1; n <= pdf.numPages; n++) {
      const target = path.join(directory, `${n}.json`);
      let indexed;
      try {
        indexed = JSON.parse(await fs.readFile(target, "utf8"));
        if (
          indexed.method !== INDEX_VERSION ||
          indexed.page !== n ||
          typeof indexed.text !== "string"
        )
          indexed = null;
      } catch {
        indexed = null;
      }
      if (!indexed) {
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        const text = content.items
          .map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : " ") : ""))
          .join("");
        indexed = indexPage(n, text);
        await save(target, indexed);
        page.cleanup();
      }
      pages.push({ document: hash, index: indexed });
      record.completedPages = n;
      await save(path.join(directory, "status.json"), record);
    }
    record.status = "Native index complete — visual review pending";
    documents.push(record);
    await save(path.join(directory, "status.json"), record);
    console.log(`Indexed ${pdf.numPages} pages; document ${hash.slice(0, 12)}`);
  } finally {
    await task.destroy();
  }
}
await save(path.join(output, "manifest.json"), {
  method: INDEX_VERSION,
  documents,
  relationships: linkPages(pages),
  warning:
    "Native mention index only; not a takeoff or confirmed cross-sheet reconciliation.",
});
