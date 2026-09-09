// Store only changed leaf values rather than copying every project on each keystroke.
export function changedValues(
  before: unknown,
  after: unknown,
  path = "",
): { before: Record<string, unknown>; after: Record<string, unknown> } {
  if (JSON.stringify(before) === JSON.stringify(after))
    return { before: {}, after: {} };
  if (
    before !== null &&
    after !== null &&
    typeof before === "object" &&
    typeof after === "object"
  ) {
    const a = before as Record<string, unknown>,
      b = after as Record<string, unknown>;
    const result = {
      before: {} as Record<string, unknown>,
      after: {} as Record<string, unknown>,
    };
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (key === "audit") continue;
      const diff = changedValues(a[key], b[key], path ? `${path}.${key}` : key);
      Object.assign(result.before, diff.before);
      Object.assign(result.after, diff.after);
    }
    return result;
  }
  return {
    before: { [path]: before ?? null },
    after: { [path]: after ?? null },
  };
}
