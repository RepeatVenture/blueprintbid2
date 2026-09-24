"use client";
import type { VisualItem, visualResultSchema } from "@/lib/vision";
import type { z } from "zod";
export type VisualPage = {
  page: number;
  model: string;
  promptVersion: string;
  responseId: string | null;
  focus?: {
    room: string;
    detail: string;
    source: string;
    evidenceContext?: string;
  } | null;
  result: z.infer<typeof visualResultSchema>;
};
export function VisualReview({
  pages,
  name,
  version,
  onCandidate,
}: {
  pages: VisualPage[];
  name: string;
  version: number;
  onCandidate: (source: string, evidence: string, item?: VisualItem) => void;
}) {
  return (
    <>
      {pages.map((p) => (
        <section
          key={
            p.responseId ||
            `${p.page}-${p.focus?.room || ""}-${p.focus?.detail || ""}`
          }
          className="card"
          style={{ marginTop: 20 }}
        >
          <h3>
            Visual review · page {p.page} ·{" "}
            {p.result.sheet || "Sheet label unclear"}
          </h3>
          <p>{p.result.summary}</p>
          {p.focus?.evidenceContext && (
            <details>
              <summary>
                Linked source evidence supplied for this analysis
              </summary>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {p.focus.evidenceContext}
              </p>
            </details>
          )}
          <p className="muted">
            Model: {p.model} · {p.promptVersion} · This page only; all findings
            need verification.
          </p>
          {[
            ...p.result.conflicts.map((t) => `Conflict: ${t}`),
            ...p.result.missingInformation.map((t) => `Missing: ${t}`),
          ].map((t, i) => (
            <p className="error" key={i}>
              {t}
            </p>
          ))}
          {p.result.items.map((item, i) => (
            <div className="card" key={i} style={{ marginTop: 12 }}>
              <h3>{item.description}</h3>
              <p>
                {item.room} · {item.detail} · Proposed quantity:{" "}
                {item.quantity ?? "Unknown"} {item.unit ?? ""} (
                {item.quantityBasis})
              </p>
              <p>
                Physical count: {item.physicalCount ?? "Unknown"}
                <br />
                Furnished by: {item.furnishing ?? "Unknown"} · Installed by:{" "}
                {item.installation ?? "Unknown"}
                <br />
                Dimensions: {item.dimensions || "Not established"}
                <br />
                Materials: {item.materials || "Not established"}
                <br />
                Finish: {item.finish || "Not established"}
                <br />
                Hardware: {item.hardware || "Not established"}
              </p>
              <blockquote>{item.evidence}</blockquote>
              {item.uncertainties.map((u, j) => (
                <p key={j}>Review: {u}</p>
              ))}
              <button
                className="button secondary"
                onClick={() =>
                  onCandidate(
                    `${name}, V${version}, page ${p.page}, ${item.sheet}, ${item.detail}. Vision ${p.model}, ${p.promptVersion}, response ${p.responseId || "unavailable"}`.slice(
                      0,
                      2000,
                    ),
                    item.evidence,
                    item,
                  )
                }
              >
                Use proposed scope for review
              </button>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
