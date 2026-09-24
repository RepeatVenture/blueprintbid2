export const INDEX_VERSION = "native-index-v1";
export type IndexedPage = ReturnType<typeof indexPage>;
function matches(text: string, pattern: RegExp) {
  return [
    ...new Set(Array.from(text.matchAll(pattern), (m) => m[0].toUpperCase())),
  ].sort();
}
export function indexPage(page: number, text: string) {
  return {
    page,
    method: INDEX_VERSION,
    reviewStatus: "Needs review" as const,
    text,
    // Mentions include cross references and must not be mistaken for the page's sheet identity.
    sheetMentions: matches(text, /\b[A-Z]{1,3}[.-]\d{3}(?:\.\d{2})?\b/gi),
    roomMentions: matches(text, /\b\d{3}-\d{2}\b/g),
    sectionMentions: matches(text, /\b\d{2}\s+\d{2}\s+\d{2}\b/g).map((s) =>
      s.replace(/\s+/g, " "),
    ),
    finishMentions: matches(text, /\b(?:PL|PLC|SS|SC|MB)[-]?\d{1,2}[A-Z]?\b/gi),
    hasMillworkKeywords:
      /millwork|casework|cabinet|countertop|architectural woodwork/i.test(text),
    needsVisualReview: true,
    littleNativeText: text.trim().length < 20,
  };
}
export function linkPages(pages: { document: string; index: IndexedPage }[]) {
  const groups = new Map<string, { document: string; page: number }[]>();
  for (const { document, index } of pages) {
    for (const [kind, values] of [
      ["sheet", index.sheetMentions],
      ["room", index.roomMentions],
      ["finish", index.finishMentions],
    ] as const) {
      for (const value of values) {
        const key = `${kind}:${value}`;
        const group = groups.get(key) || [];
        group.push({ document, page: index.page });
        groups.set(key, group);
      }
    }
  }
  return Array.from(groups, ([mention, sources]) => ({
    mention,
    sources,
    relationship: "Shared mention — verify relationship",
  }));
}
