import { expect, it } from "vitest";
import { indexPage, linkPages } from "../src/lib/document-index";
it("keeps references as mentions and never claims measured scope", () => {
  const page = indexPage(
    3,
    "Cabinet see A.501.00 and A.502; room 400-16 PL2C SECTION 06 41 16",
  );
  expect(page.sheetMentions).toEqual(["A.501.00", "A.502"]);
  expect(page.roomMentions).toEqual(["400-16"]);
  expect(page.sectionMentions).toEqual(["06 41 16"]);
  expect(page.needsVisualReview).toBe(true);
});
it("links shared references without collapsing room instances", () => {
  const a = indexPage(1, "400-16 A.501");
  const b = indexPage(2, "400-18 A.501");
  const links = linkPages([
    { document: "a", index: a },
    { document: "a", index: b },
  ]);
  expect(links.find((l) => l.mention === "sheet:A.501")?.sources).toHaveLength(
    2,
  );
  expect(links.filter((l) => l.mention.startsWith("room:"))).toHaveLength(2);
});
it("keeps blank pages requiring visual review", () => {
  expect(indexPage(1, "").littleNativeText).toBe(true);
});
