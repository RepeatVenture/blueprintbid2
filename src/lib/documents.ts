import { z } from "zod";
export const MAX_PDF_BYTES = 20 * 1024 * 1024;
export function validatePdf(bytes: Uint8Array, name: string, type: string) {
  if (!name.toLowerCase().endsWith(".pdf") || type !== "application/pdf")
    throw new Error("Only PDF files are supported.");
  if (bytes.length < 8 || bytes.length > MAX_PDF_BYTES)
    throw new Error("PDF must be between 8 bytes and 20 MiB.");
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
    throw new Error("File signature is not PDF.");
}
export const candidateSchema = z.object({
  page: z.number().int().positive(),
  text: z.string().min(1).max(2000),
  category: z.enum(["Casework", "Countertop", "Paneling", "Specification"]),
  confidence: z.number().min(0).max(1),
  method: z.literal("native-text-keyword-v1"),
  status: z.literal("Needs review"),
});
export type Candidate = z.infer<typeof candidateSchema>;
export interface ExtractionProvider {
  name: string;
  extract(
    bytes: Uint8Array,
  ): Promise<{ pages: number; candidates: Candidate[]; warnings: string[] }>;
}
// Document content is only data. No tool calls, prompts or privileged actions are derived from it.
export function candidatesFromPages(pages: string[]): Candidate[] {
  return pages.flatMap((text, i) =>
    text
      .split(/\n|(?<=[.;])\s+/)
      .filter((line) =>
        /cabinet|casework|millwork|countertop|wood panel|architectural woodwork/i.test(
          line,
        ),
      )
      .slice(0, 50)
      .map((line) =>
        candidateSchema.parse({
          page: i + 1,
          text: line.slice(0, 2000),
          category: /countertop/i.test(line)
            ? "Countertop"
            : /panel/i.test(line)
              ? "Paneling"
              : /section|specification/i.test(line)
                ? "Specification"
                : "Casework",
          confidence: 0.35,
          method: "native-text-keyword-v1",
          status: "Needs review",
        }),
      ),
  );
}

export function validateDocument(
  bytes: Uint8Array,
  name: string,
  type: string,
) {
  if (type === "application/pdf") {
    validatePdf(bytes, name, type);
    return { mime: type, extension: "pdf" };
  }
  if (bytes.length < 24 || bytes.length > MAX_PDF_BYTES)
    throw new Error("Image must be between 24 bytes and 20 MiB.");
  if (
    type === "image/png" &&
    /\.png$/i.test(name) &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n)
  ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(16),
      height = view.getUint32(20);
    if (!width || !height || width * height > 40000000)
      throw new Error("Image exceeds 40 megapixels.");
    return { mime: type, extension: "png" };
  }
  if (
    type === "image/jpeg" &&
    /\.jpe?g$/i.test(name) &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return { mime: type, extension: "jpg" };
  throw new Error(
    "Supported formats: PDF, PNG and JPEG with matching file signatures.",
  );
}
