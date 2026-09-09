import { it, expect } from "vitest";
import { boundedBody, rateLimit } from "../src/lib/http";
it("bounds bodies even without Content-Length", async () => {
  const req = new Request("http://localhost", {
    method: "POST",
    body: "x".repeat(101),
  });
  await expect(boundedBody(req, 100)).rejects.toThrow("too large");
});
it("rate guard rejects over limit and resets its window", () => {
  rateLimit("test", 1, 0);
  expect(() => rateLimit("test", 1, 1)).toThrow();
  expect(() => rateLimit("test", 1, 60000)).not.toThrow();
});
