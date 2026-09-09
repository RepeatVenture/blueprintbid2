import type { ExtractionProvider } from "./documents";
import { candidatesFromPages } from "./documents";
export async function nativePages(bytes: Uint8Array) {
  const started = Date.now();
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({
    data: bytes,
    useSystemFonts: true,
    disableFontFace: true,
  });
  try {
    const pdf = await task.promise;
    const pages: string[] = [];
    if (pdf.numPages > 100)
      throw new Error("Split PDF into files of 100 pages or fewer.");
    for (let n = 1; n <= pdf.numPages; n++) {
      if (Date.now() - started > 45000)
        throw new Error("PDF time limit reached");
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((item) =>
            "str" in item
              ? item.str + ("hasEOL" in item && item.hasEOL ? "\n" : " ")
              : "",
          )
          .join(""),
      );
      page.cleanup();
    }
    return pages;
  } finally {
    await task.destroy();
  }
}
export const nativeProvider: ExtractionProvider = {
  name: "pdfjs-native",
  async extract(bytes) {
    const pages = await nativePages(bytes);
    const scanned = pages.filter((p) => p.trim().length < 20).length;
    return {
      pages: pages.length,
      candidates: candidatesFromPages(pages),
      warnings: scanned
        ? [`${scanned} pages have little native text. OCR is not configured.`]
        : [],
    };
  },
};
