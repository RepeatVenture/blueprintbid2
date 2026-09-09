type OperationalFields = {
  status?: number;
  pages?: number;
  durationMs?: number;
  outcome?: "ok" | "failed";
};
// Deliberately excludes arbitrary error objects, document text, cookies and payment payloads.
export function logEvent(event: string, fields: OperationalFields = {}) {
  console.info(
    JSON.stringify({
      time: new Date().toISOString(),
      service: "blueprintbid",
      event,
      ...fields,
    }),
  );
}
