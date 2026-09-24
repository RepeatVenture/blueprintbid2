"use client";
import type { VisualItem } from "@/lib/vision";
import { VisualReview, type VisualPage } from "./visual-review";
import { useEffect, useState } from "react";
import { Candidate, candidatesFromPages } from "@/lib/documents";
type Doc = {
  mime_type: string;
  id: string;
  name: string;
  version: number;
  category: string;
  status: string;
  created_at: string;
  processing_error: string | null;
  extraction: { candidates?: Candidate[]; visualPages?: VisualPage[] } | null;
};
export function DocumentPanel({
  mode,
  projectId,
  organizationId,
  onCandidate,
}: {
  mode: "demo" | "hosted";
  projectId: string;
  organizationId?: string;
  onCandidate: (source: string, evidence: string, item?: VisualItem) => void;
}) {
  const [visionEnabled, setVisionEnabled] = useState(false),
    [visionPage, setVisionPage] = useState("1"),
    [focusRoom, setFocusRoom] = useState(""),
    [focusDetail, setFocusDetail] = useState(""),
    [sourceContext, setSourceContext] = useState(""),
    [consent, setConsent] = useState(false);
  useEffect(() => {
    void fetch("/api/documents/vision")
      .then((r) => r.json())
      .then((d) => setVisionEnabled(d.enabled))
      .catch(() => setVisionEnabled(false));
  }, []);
  const [docs, setDocs] = useState<Doc[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [text, setText] = useState(
      "ROOM 101 — Provide six base cabinets. Countertop finish requires approval.",
    ),
    [page, setPage] = useState("1"),
    [source, setSource] = useState("Synthetic A-501 rev 1"),
    [candidates, setCandidates] = useState<Candidate[]>([]);
  async function load() {
    try {
      const res = await fetch(`/api/documents?projectId=${projectId}`);
      if (!res.ok) throw new Error("Document inventory unavailable.");
      setDocs((await res.json()).documents);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  useEffect(() => {
    if (mode === "hosted")
      void fetch(`/api/documents?projectId=${projectId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.documents) setDocs(d.documents);
          else setMessage("Document inventory unavailable.");
        })
        .catch(() => setMessage("Document inventory unavailable."));
  }, [mode, projectId]);
  async function upload(form: FormData) {
    setBusy(true);
    setMessage("Uploading document…");
    try {
      form.set("projectId", projectId);
      form.set("organizationId", organizationId || "");
      const res = await fetch("/api/documents", { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Uploaded privately. Text extraction has not run.");
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function process(id: string, visual = false) {
    setBusy(true);
    setMessage(
      visual ? "Analyzing drawing visually…" : "Extracting native text…",
    );
    try {
      const res = await fetch(
        visual ? "/api/documents/vision" : "/api/documents/process",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            visual
              ? {
                  id,
                  page: Number(visionPage),
                  consent,
                  focus: {
                    room: focusRoom,
                    detail: focusDetail,
                    source: "Selected document",
                    evidenceContext: sourceContext,
                  },
                }
              : { id },
          ),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setMessage(result.message);
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="card">
        <h2>Document inventory & evidence</h2>
        <p>
          Upload PDFs, PNGs or JPEGs up to 20 MiB. Visual analysis reads drawing
          imagery and proposes scope, quantities and requirements. Select an
          original page number and review all findings before estimating. Native
          text review remains available for PDFs.
        </p>
        {mode === "demo" ? (
          <div className="banner">
            Document uploads require a configured hosted account. Use the
            synthetic text review below in this demo.
          </div>
        ) : (
          <form action={upload}>
            <div className="fields">
              <label>
                PDF or image file
                <input
                  name="file"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  required
                />
              </label>
              <label>
                Document version
                <input
                  name="version"
                  type="number"
                  min={1}
                  defaultValue={1}
                  required
                />
              </label>
              <label>
                Category
                <select name="category">
                  {[
                    "Drawings",
                    "Specifications",
                    "Addendum",
                    "Vendor quote",
                    "Other",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
            <button className="button" disabled={busy}>
              Upload privately
            </button>
          </form>
        )}
        <p role="status">{message}</p>
        <div className="card">
          <h3>Visual drawing analysis</h3>
          <label>
            Room to review (optional)
            <input
              maxLength={120}
              value={focusRoom}
              onChange={(e) => setFocusRoom(e.target.value)}
            />
          </label>
          <label>
            Sheet / detail to review (optional)
            <input
              maxLength={120}
              value={focusDetail}
              onChange={(e) => setFocusDetail(e.target.value)}
            />
          </label>
          <label>
            Linked drawing/specification evidence (optional)
            <textarea
              maxLength={16000}
              value={sourceContext}
              onChange={(e) => {
                setSourceContext(e.target.value);
                setConsent(false);
              }}
              placeholder="Include document, page and detail references with each excerpt. Keep reference takeoff answers out of extraction inputs."
            />
          </label>
          <p>
            {visionEnabled
              ? "Vision provider configured. Each analysis sends one selected page/image to OpenAI and may incur API charges. Limit: 25 requests per organization per UTC day."
              : "Visual analysis needs owner configuration: OpenAI API key, vision model and explicit enablement. No model call runs while disabled."}
          </p>
          <label>
            Original PDF page (images use page 1)
            <input
              type="number"
              min="1"
              max="2000"
              value={visionPage}
              onChange={(e) => setVisionPage(e.target.value)}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I authorize sending this page/image and the linked evidence entered
            above to the configured provider for paid visual analysis.
          </label>
        </div>
        {docs.map((d) => (
          <div key={d.id}>
            <h3>
              {d.name} · V{d.version}
            </h3>
            <p>
              {d.category} · {d.status} · {d.created_at.slice(0, 10)}
            </p>
            <a
              className="text-button"
              href={`/api/documents/download?id=${d.id}`}
            >
              Download original source
            </a>
            {d.processing_error && (
              <p className="error">{d.processing_error}</p>
            )}
            <button
              className="button secondary"
              disabled={busy || d.mime_type !== "application/pdf"}
              onClick={() => process(d.id)}
            >
              Extract native text / retry
            </button>
            <button
              className="button"
              disabled={
                busy ||
                !visionEnabled ||
                !consent ||
                !Number.isInteger(Number(visionPage)) ||
                Number(visionPage) < 1
              }
              onClick={() => process(d.id, true)}
            >
              Analyze page visually
            </button>
            <VisualReview
              pages={d.extraction?.visualPages || []}
              name={d.name}
              version={d.version}
              onCandidate={onCandidate}
            />
            {d.extraction?.candidates?.map((c, i) => (
              <div className="card" key={i}>
                <p>
                  Page {c.page} · Needs review · Keyword match, low confidence
                </p>
                <p>{c.text}</p>
                <button
                  className="text-button"
                  onClick={() =>
                    onCandidate(
                      `${d.name}, V${d.version}, page ${c.page}`,
                      c.text,
                    )
                  }
                >
                  Create scope candidate
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Review page text</h3>
        <p>
          Paste a page excerpt, identify its source, and generate review
          candidates. This deterministic helper does not use AI. Verify every
          source against the original document.
        </p>
        <div className="fields two">
          <label>
            Source document / revision
            <input value={source} onChange={(e) => setSource(e.target.value)} />
          </label>
          <label>
            Page number
            <input
              type="number"
              min={1}
              max={2000}
              value={page}
              onChange={(e) => setPage(e.target.value)}
            />
          </label>
        </div>
        <label>
          Page text
          <textarea
            value={text}
            maxLength={20000}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button
          className="button secondary"
          disabled={
            !source.trim() ||
            !Number.isInteger(Number(page)) ||
            Number(page) < 1
          }
          onClick={() => {
            setCandidates(
              candidatesFromPages([text]).map((c) => ({
                ...c,
                page: Number(page),
              })),
            );
            setMessage(
              "Text reviewed. Keyword matches only; no automated quantity takeoff.",
            );
          }}
        >
          Find review candidates
        </button>
        {candidates.map((c, i) => (
          <div key={i} className="card" style={{ marginTop: 14 }}>
            <span className="status">NEEDS REVIEW · PAGE {c.page}</span>
            <p>{c.text}</p>
            <button
              className="text-button"
              onClick={() => onCandidate(`${source}, page ${c.page}`, c.text)}
            >
              Add to scope for review
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
