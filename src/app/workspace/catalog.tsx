"use client";
import { useEffect, useState } from "react";
import { Scope, scopeSchema } from "@/lib/model";
import { newScope, uid } from "@/lib/demo";
type Template = { id: string; name: string; version: number; data: Scope };
export function CatalogPanel({
  mode,
  organizationId,
  selected,
  onApply,
}: {
  mode: "demo" | "hosted";
  organizationId?: string;
  selected?: Scope;
  onApply: (s: Scope) => void;
}) {
  const [rows, setRows] = useState<Template[]>([]),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (mode === "demo") {
      const timer = setTimeout(() => {
        try {
          const raw = localStorage.getItem("blueprintbid-catalog-v1");
          setRows(
            raw
              ? JSON.parse(raw)
              : [
                  {
                    id: "example-base",
                    name: "Two-door base cabinet — example",
                    version: 1,
                    data: newScope(),
                  },
                ],
          );
        } catch {
          setMessage("Saved catalog could not be read.");
        }
      }, 0);
      return () => clearTimeout(timer);
    }
    void fetch(`/api/catalogs?organizationId=${organizationId}`)
      .then((r) => r.json())
      .then((d) => setRows(d.catalogs || []))
      .catch(() => setMessage("Catalog unavailable."));
  }, [mode, organizationId]);
  async function save() {
    if (!selected) return;
    try {
      scopeSchema.parse(selected);
      if (mode === "demo") {
        const next = [
          ...rows,
          {
            id: uid(),
            name: selected.description,
            version:
              Math.max(
                0,
                ...rows
                  .filter((r) => r.name === selected.description)
                  .map((r) => r.version),
              ) + 1,
            data: {
              ...structuredClone(selected),
              source: "",
              evidence: "",
              notes: "",
              room: "",
              status: "Needs review" as const,
              responsibility: "Unknown" as const,
            },
          },
        ];
        localStorage.setItem("blueprintbid-catalog-v1", JSON.stringify(next));
        setRows(next);
      } else {
        const res = await fetch("/api/catalogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId, scope: selected }),
        });
        if (!res.ok) throw new Error("Catalog save failed.");
        const data = await fetch(
          `/api/catalogs?organizationId=${organizationId}`,
        ).then((r) => r.json());
        setRows(data.catalogs);
      }
      setMessage(
        "Saved as a new assembly template version. Existing project instances are unchanged.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <div className="card">
      <h2>Company assembly library</h2>
      <p>
        Templates contain editable materials, hardware, finish and labor
        components. Project evidence and private notes are removed when saving a
        template. Applied templates always need scope review.
      </p>
      <button className="button" disabled={!selected} onClick={save}>
        Save selected assembly as new template version
      </button>
      {!selected && (
        <p className="muted">
          Open “Inspect / edit” on a scope item first to select the assembly you
          want to save.
        </p>
      )}
      <p role="status">{message}</p>
      <div className="grid three">
        {rows.map((r) => (
          <div className="card" key={r.id}>
            <h3>{r.name}</h3>
            <p>
              Version {r.version} · {r.data.components.length} components
            </p>
            <button
              className="button secondary"
              onClick={() => {
                try {
                  onApply({
                    ...scopeSchema.parse(structuredClone(r.data)),
                    id: uid(),
                    status: "Needs review",
                    responsibility: "Unknown",
                    source: "",
                    evidence: "",
                    notes: `Assembly template ${r.name} v${r.version}`,
                  });
                } catch {
                  setMessage("Template data is invalid.");
                }
              }}
            >
              Add project instance
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
