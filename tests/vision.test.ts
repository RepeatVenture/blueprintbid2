import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { analyzeVisual, visualInput } from "../src/lib/vision";
const item = {
  description: "Base cabinet",
  category: "Casework",
  room: "Kitchen",
  sheet: "A1",
  detail: "2",
  quantity: "2",
  unit: "EA",
  quantityBasis: "visually counted",
  dimensions: "",
  materials: "",
  finish: "",
  hardware: "",
  evidence: "Two separate boxes in elevation 2",
  uncertainties: [],
  confidence: 0.7,
};
const config = { key: "test-only", model: "test-model" };
function transport(result: unknown, status = "completed"): typeof fetch {
  return async (_url, init) => {
    const request = JSON.parse(String(init?.body));
    expect(request.store).toBe(false);
    expect(request.text.format.strict).toBe(true);
    expect(request.input[0].content[1].type).toBe("input_image");
    return Response.json({
      status,
      id: "test-response",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(result) }],
        },
      ],
    });
  };
}
const result = (entry = item) => ({
  sheet: "A1",
  summary: "Kitchen",
  items: [entry],
  conflicts: [],
  missingInformation: [],
});
describe("visual analysis contract", () => {
  it("extracts only the selected PDF page", async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    pdf.addPage();
    const input = await visualInput(await pdf.save(), "application/pdf", 2);
    expect(input.type).toBe("input_file");
    const extracted = await PDFDocument.load(
      Buffer.from(input.file_data!.split(",")[1], "base64"),
    );
    expect(extracted.getPageCount()).toBe(1);
    await expect(
      visualInput(await pdf.save(), "application/pdf", 3),
    ).rejects.toThrow();
  });
  it("returns provenance and structured visual evidence", async () => {
    const actual = await analyzeVisual(
      new Uint8Array(),
      "image/png",
      1,
      config,
      transport(result()),
    );
    expect(actual.result.items[0].quantity).toBe("2");
    expect(actual.responseId).toBe("test-response");
  });
  it("removes unsupported quantities", async () => {
    const actual = await analyzeVisual(
      new Uint8Array(),
      "image/png",
      1,
      config,
      transport(result({ ...item, quantityBasis: "unknown" })),
    );
    expect(actual.result.items[0].quantity).toBeNull();
    expect(actual.result.items[0].unit).toBeNull();
  });
  it("rejects incomplete output and missing evidence", async () => {
    await expect(
      analyzeVisual(
        new Uint8Array(),
        "image/png",
        1,
        config,
        transport(result(), "incomplete"),
      ),
    ).rejects.toThrow("incomplete");
    await expect(
      analyzeVisual(
        new Uint8Array(),
        "image/png",
        1,
        config,
        transport(result({ ...item, evidence: "" })),
      ),
    ).rejects.toThrow("evidence");
  });
  it("rejects malformed model output", async () => {
    await expect(
      analyzeVisual(
        new Uint8Array(),
        "image/png",
        1,
        config,
        transport({ items: [] }),
      ),
    ).rejects.toThrow();
  });
});
