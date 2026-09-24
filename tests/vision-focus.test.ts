import { expect, it } from "vitest";
import { analyzeVisual } from "../src/lib/vision";
it("transmits focused source metadata and separate responsibility fields", async () => {
  const output = {
    sheet: "A.1",
    summary: "One room",
    items: [],
    conflicts: [],
    missingInformation: [],
  };
  const transport: typeof fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    expect(body.input[0].content[0].text).toContain("Room 101");
    const properties =
      body.text.format.schema.properties.items.items.properties;
    expect(properties.physicalCount).toBeDefined();
    expect(properties.furnishing).toBeDefined();
    expect(properties.installation).toBeDefined();
    return Response.json({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(output) }],
        },
      ],
    });
  };
  const result = await analyzeVisual(
    new Uint8Array(),
    "image/png",
    1,
    { key: "test", model: "test" },
    transport,
    { room: "Room 101", detail: "2", source: "Synthetic" },
  );
  expect(result.focus?.room).toBe("Room 101");
});
