"use client";
import { roundLinearFeet } from "@/lib/quantities";
import { CommercialPanel } from "./commercial";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { changedValues } from "@/lib/audit";
import {
  calculate,
  customerProposal,
  issueProposal,
  money,
  warnings,
  componentCost,
} from "@/lib/estimate";
import { Project, Scope, projectSchema, Component } from "@/lib/model";
import { demoProject, newScope, uid } from "@/lib/demo";
import { browserClient } from "@/lib/supabase-browser";
import { CatalogPanel } from "./catalog";
import { DocumentPanel } from "./documents";
type Proposal = ReturnType<typeof customerProposal>;
const tabs = [
  "Project",
  "Scope & estimate",
  "Documents",
  "Catalog",
  "Logistics",
  "Qualifications",
  "Commercial review",
  "Proposal",
  "History",
] as const;
const storageKey = "blueprintbid-demo-v1";
function download(name: string, content: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export default function Workspace({
  mode,
  initial,
  organizationId,
}: {
  mode: "demo" | "hosted";
  initial?: Project;
  organizationId?: string;
}) {
  const router = useRouter();
  const [persistedProposals, setPersistedProposals] = useState(
    initial?.proposals.length || 0,
  );
  const [project, setProject] = useState<Project | null>(initial || null),
    [tab, setTab] = useState<(typeof tabs)[number]>("Scope & estimate"),
    [selected, setSelected] = useState(""),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(""),
    [filter, setFilter] = useState(""),
    [proposalVersion, setProposalVersion] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (mode !== "demo") return;
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        setProject(raw ? projectSchema.parse(JSON.parse(raw)) : demoProject());
      } catch {
        setError(
          "Saved demo could not be read. Export or clear this site’s browser storage to recover. Your saved data has not been overwritten.",
        );
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [mode]);
  if (!project)
    return (
      <div className="workspace">
        <p role="status">{error || "Opening workspace…"}</p>
      </div>
    );
  const p = project;
  let totals: ReturnType<typeof calculate> | undefined,
    calculationError = "";
  try {
    totals = calculate(p);
  } catch {
    calculationError =
      "Check numeric inputs: use nonnegative decimals, rates at most 100%, and target margin below 100%.";
  }
  const active = p.scope.find((s) => s.id === selected);
  function update(next: Project, action: string) {
    const diff = changedValues(p, next);
    setProject({
      ...next,
      audit: [
        ...p.audit,
        {
          at: new Date().toISOString(),
          actor:
            mode === "demo"
              ? "Local demo estimator"
              : "Authenticated estimator",
          action,
          before: JSON.stringify(diff.before),
          after: JSON.stringify(diff.after),
        },
      ],
    });
    setSaved("Unsaved changes");
    setError("");
  }
  function changeScope(id: string, patch: Partial<Scope>) {
    update(
      {
        ...p,
        scope: p.scope.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      },
      "Edit scope / pricing",
    );
  }
  function changeComponent(id: string, patch: Partial<Component>) {
    if (active)
      changeScope(active.id, {
        components: active.components.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      });
  }
  async function save() {
    setBusy(true);
    try {
      const parsed = projectSchema.parse(p);
      calculate(parsed);
      if (mode === "demo")
        localStorage.setItem(storageKey, JSON.stringify(parsed));
      else {
        const response = await fetch("/api/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project: parsed, organizationId }),
        });
        if (!response.ok)
          throw new Error(
            "Save failed. Check your session, permissions, or whether another editor saved this project.",
          );
        const result = await response.json();
        setProject(result.project);
      }
      setPersistedProposals(p.proposals.length);
      setSaved(`Saved ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }
  function issue() {
    try {
      const next = issueProposal(p);
      update(next, "Issue immutable proposal snapshot");
      setProposalVersion(next.proposals.length);
      setSaved("Proposal created; save project to persist it.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function pdf(proposal: Proposal) {
    setBusy(true);
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      });
      if (!res.ok)
        throw new Error(
          "PDF generation failed. Check proposal text and try again.",
        );
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-v${proposal.version}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const preview: Proposal | undefined = proposalVersion
    ? JSON.parse(
        p.proposals.find((v) => v.version === proposalVersion)?.snapshot ||
          "null",
      )
    : totals
      ? customerProposal(p, p.proposals.length + 1, new Date().toISOString())
      : undefined;
  const problems = calculationError ? [calculationError] : warnings(p);
  return (
    <div className="workspace">
      {mode === "demo" && (
        <div className="banner">
          SYNTHETIC DEMO · Saved only in this browser. Example costs are not
          industry standards. Use synthetic data only.{" "}
          <a href="/workspace">Open hosted workspace ↗</a>
        </div>
      )}
      <div className="workspace-head">
        <div>
          <p className="eyebrow">
            PROJECT WORKSPACE / {p.status.toUpperCase()}
          </p>
          <h1>{p.name}</h1>
          <p className="muted">
            {p.client} · {p.scope.length} scope items · USD
          </p>
        </div>
        <div>
          <div className="actions">
            <button
              className="button secondary"
              onClick={() =>
                download(
                  "blueprintbid-project.json",
                  JSON.stringify(p, null, 2),
                )
              }
            >
              Export internal project
            </button>
            <button
              className="button"
              onClick={save}
              disabled={busy || !!calculationError}
            >
              Save project
            </button>
          </div>
          <span role="status" className="muted">
            {saved || "Use Save project to persist changes."}
          </span>
        </div>
      </div>
      {(error || calculationError) && (
        <div role="alert" className="error">
          {error || calculationError}
        </div>
      )}
      <div className="stats">
        <div className="stat">
          <span>Estimated cost</span>
          <strong>${totals ? money(totals.cost) : "—"}</strong>
        </div>
        <div className="stat">
          <span>Selling price</span>
          <strong>${totals ? money(totals.sell) : "—"}</strong>
        </div>
        <div className="stat">
          <span>Gross margin</span>
          <strong>{totals ? totals.margin.toFixed(2) : "—"}%</strong>
        </div>
        <div className="stat">
          <span>Review checks</span>
          <strong>{problems.length} open</strong>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Project sections">
        {tabs.map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <section role="tabpanel" aria-label={tab}>
          {tab === "Project" && (
            <div className="card">
              <h2>Project information</h2>
              <div className="fields">
                {(
                  ["name", "client", "company", "address", "dueDate"] as const
                ).map((k) => (
                  <Field
                    key={k}
                    label={
                      k === "dueDate"
                        ? "Bid due date"
                        : k.charAt(0).toUpperCase() + k.slice(1)
                    }
                    type={k === "dueDate" ? "date" : "text"}
                    value={p[k]}
                    onChange={(v) =>
                      update({ ...p, [k]: v }, `Edit project ${k}`)
                    }
                  />
                ))}
                <label>
                  Project status
                  <select
                    value={p.status}
                    onChange={(e) =>
                      update(
                        { ...p, status: e.target.value as Project["status"] },
                        "Change project status",
                      )
                    }
                  >
                    {["Estimating", "Issued", "Awarded"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p>
                Export contains internal costs and notes. Share only the
                customer proposal with your client.
              </p>
              {p.status === "Awarded" && (
                <button
                  className="button secondary"
                  onClick={() =>
                    download(
                      "internal-handoff.json",
                      JSON.stringify(
                        {
                          project: p,
                          estimated: totals,
                          notice:
                            "INTERNAL — includes costs and unresolved risks",
                        },
                        null,
                        2,
                      ),
                    )
                  }
                >
                  Export internal handoff
                </button>
              )}
            </div>
          )}
          {tab === "Scope & estimate" && (
            <>
              <div className="actions">
                <button
                  className="button"
                  onClick={() => {
                    const s = newScope();
                    update(
                      { ...p, scope: [...p.scope, s] },
                      "Add assembly instance",
                    );
                    setSelected(s.id);
                  }}
                >
                  ＋ Add cabinet assembly
                </button>
                <button
                  className="button secondary"
                  onClick={() =>
                    download(
                      "scope.csv",
                      "Description,Room,Quantity,Unit,Status,Source\n" +
                        p.scope
                          .map((s) =>
                            [
                              s.description,
                              s.room,
                              s.quantity,
                              s.unit,
                              s.status,
                              s.source,
                            ]
                              .map(
                                (v) =>
                                  '"' +
                                  (/^[=+@\-\t\r]/.test(v) ? "'" : "") +
                                  v.replaceAll('"', '""') +
                                  '"',
                              )
                              .join(","),
                          )
                          .join("\n"),
                      "text/csv",
                    )
                  }
                >
                  Export scope CSV
                </button>
                <label>
                  Filter scope
                  <input
                    placeholder="Room, description, status…"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </label>
              </div>
              <div className="card table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Scope / room</th>
                      <th>Quantity</th>
                      <th>Review</th>
                      <th>Extended cost</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.scope
                      .filter((s) =>
                        `${s.description} ${s.room} ${s.status}`
                          .toLowerCase()
                          .includes(filter.toLowerCase()),
                      )
                      .map((s) => (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.description}</strong>
                            <br />
                            <span className="muted">{s.room}</span>
                          </td>
                          <td>
                            {s.quantity} {s.unit}
                          </td>
                          <td>{s.status}</td>
                          <td>
                            $
                            {money(
                              totals?.lines.find((l) => l.id === s.id)?.cost ||
                                0,
                            )}
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="text-button"
                                onClick={() => setSelected(s.id)}
                              >
                                Inspect / edit
                              </button>
                              <button
                                className="text-button"
                                onClick={() =>
                                  update(
                                    {
                                      ...p,
                                      scope: [
                                        ...p.scope,
                                        {
                                          ...structuredClone(s),
                                          id: uid(),
                                          status: "Needs review",
                                        },
                                      ],
                                    },
                                    "Duplicate scope to review",
                                  )
                                }
                              >
                                Duplicate
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!p.scope.length && (
                  <p>Add a scope item to start building the estimate.</p>
                )}
              </div>
              {active && (
                <div className="card" style={{ marginTop: 20 }}>
                  <h3>Assembly breakdown · project instance</h3>
                  <p className="muted">
                    Components below are per scope unit. Extended scope cost
                    multiplies their sum by scope quantity. Editing this
                    instance does not change the example template.
                  </p>
                  <div className="fields">
                    <Field
                      label="Description"
                      value={active.description}
                      onChange={(v) =>
                        changeScope(active.id, { description: v })
                      }
                    />
                    <Field
                      label="Room / floor / area"
                      value={active.room}
                      onChange={(v) => changeScope(active.id, { room: v })}
                    />
                    <Field
                      label="Quantity"
                      value={active.quantity}
                      onChange={(v) => changeScope(active.id, { quantity: v })}
                    />
                    <Field
                      label="Unit"
                      value={active.unit}
                      onChange={(v) => changeScope(active.id, { unit: v })}
                    />
                    {active.unit === "LF" && (
                      <button
                        type="button"
                        disabled={!/^\d+(\.\d+)?$/.test(active.quantity)}
                        onClick={() =>
                          changeScope(active.id, {
                            quantity: roundLinearFeet(active.quantity),
                          })
                        }
                      >
                        Round quantity to nearest 0.5 ft
                      </button>
                    )}
                    <label>
                      Review status
                      <select
                        value={active.status}
                        onChange={(e) =>
                          changeScope(active.id, {
                            status: e.target.value as Scope["status"],
                          })
                        }
                      >
                        {[
                          "Needs review",
                          "Confirmed",
                          "Missing information",
                          "Conflict detected",
                          "Excluded",
                        ].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Responsibility
                      <select
                        value={active.responsibility}
                        onChange={(e) =>
                          changeScope(active.id, {
                            responsibility: e.target
                              .value as Scope["responsibility"],
                          })
                        }
                      >
                        {[
                          "Included by us",
                          "Furnished by others / installed by us",
                          "Coordinated only",
                          "Excluded",
                          "Unknown",
                        ].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="Source document / revision / page / detail"
                      value={active.source}
                      onChange={(v) => changeScope(active.id, { source: v })}
                    />
                    <label>
                      Source evidence
                      <textarea
                        value={active.evidence}
                        onChange={(e) =>
                          changeScope(active.id, { evidence: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Internal estimator notes
                      <textarea
                        value={active.notes}
                        onChange={(e) =>
                          changeScope(active.id, { notes: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Component</th>
                          <th>Category</th>
                          <th>Qty / scope unit</th>
                          <th>Unit</th>
                          <th>Unit cost $</th>
                          <th>Waste %</th>
                          <th>Taxable</th>
                          <th>Cost $</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.components.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <input
                                aria-label="Component name"
                                value={c.name}
                                onChange={(e) =>
                                  changeComponent(c.id, {
                                    name: e.target.value,
                                  })
                                }
                              />
                            </td>
                            <td>
                              <select
                                aria-label="Cost category"
                                value={c.category}
                                onChange={(e) =>
                                  changeComponent(c.id, {
                                    category: e.target
                                      .value as Component["category"],
                                  })
                                }
                              >
                                {[
                                  "Material",
                                  "Hardware",
                                  "Labor",
                                  "Finish",
                                  "Subcontract",
                                  "Delivery",
                                  "Installation",
                                  "Engineering",
                                ].map((v) => (
                                  <option key={v}>{v}</option>
                                ))}
                              </select>
                            </td>
                            {(
                              ["quantity", "unit", "unitCost", "waste"] as const
                            ).map((k) => (
                              <td key={k}>
                                <input
                                  aria-label={`${c.name} ${k}`}
                                  value={c[k]}
                                  onChange={(e) =>
                                    changeComponent(c.id, {
                                      [k]: e.target.value,
                                    })
                                  }
                                />
                              </td>
                            ))}
                            <td>
                              <input
                                aria-label={`${c.name} taxable`}
                                type="checkbox"
                                checked={c.taxable}
                                onChange={(e) =>
                                  changeComponent(c.id, {
                                    taxable: e.target.checked,
                                  })
                                }
                              />
                            </td>
                            <td>
                              {calculationError ? "—" : money(componentCost(c))}
                            </td>
                            <td>
                              <button
                                className="text-button"
                                onClick={() =>
                                  changeScope(active.id, {
                                    components: active.components.filter(
                                      (x) => x.id !== c.id,
                                    ),
                                  })
                                }
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    className="text-button"
                    onClick={() =>
                      changeScope(active.id, {
                        components: [
                          ...active.components,
                          {
                            id: uid(),
                            name: "New operation or material",
                            category: "Labor",
                            quantity: "1",
                            unit: "hour",
                            unitCost: "0",
                            waste: "0",
                            taxable: false,
                          },
                        ],
                      })
                    }
                  >
                    ＋ Add component / labor operation
                  </button>
                </div>
              )}
              <div className="split" style={{ marginTop: 20 }}>
                <div className="card">
                  <h3>Price strategy</h3>
                  <div className="fields two">
                    <label>
                      Pricing method
                      <select
                        value={p.pricing.mode}
                        onChange={(e) =>
                          update(
                            {
                              ...p,
                              pricing: {
                                ...p.pricing,
                                mode: e.target.value as "markup" | "margin",
                              },
                            },
                            "Change pricing method",
                          )
                        }
                      >
                        <option value="markup">Markup on cost</option>
                        <option value="margin">Target gross margin</option>
                      </select>
                    </label>
                    {(["rate", "overhead", "contingency", "tax"] as const).map(
                      (k) => (
                        <Field
                          key={k}
                          label={`${k === "rate" ? p.pricing.mode : k} %`}
                          value={p.pricing[k]}
                          onChange={(v) =>
                            update(
                              { ...p, pricing: { ...p.pricing, [k]: v } },
                              `Change ${k}`,
                            )
                          }
                        />
                      ),
                    )}
                  </div>
                  <p className="formula">
                    {p.pricing.mode === "markup"
                      ? "Selling price = cost × (1 + markup / 100)"
                      : "Selling price = cost ÷ (1 − margin / 100)"}
                  </p>
                  <p className="muted">
                    Overhead applies to direct cost. Contingency applies to
                    direct cost + overhead. Tax is a cost allowance on taxable
                    components only, before pricing; confirm your jurisdiction’s
                    treatment separately.
                  </p>
                </div>
                <div className="card totals">
                  <h3>Cost reconciliation</h3>
                  {totals &&
                    (
                      [
                        "direct",
                        "overhead",
                        "contingency",
                        "tax",
                        "cost",
                        "sell",
                        "profit",
                      ] as const
                    ).map((k) => (
                      <div key={k}>
                        <span>
                          {k === "sell"
                            ? "Selling price"
                            : k === "cost"
                              ? "Total estimated cost"
                              : k.charAt(0).toUpperCase() + k.slice(1)}
                        </span>
                        <strong>${money(totals[k])}</strong>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
          {tab === "Catalog" && (
            <CatalogPanel
              mode={mode}
              organizationId={organizationId}
              selected={active}
              onApply={(s) => {
                update(
                  { ...p, scope: [...p.scope, s] },
                  "Apply versioned assembly",
                );
                setSelected(s.id);
                setTab("Scope & estimate");
              }}
            />
          )}
          {tab === "Documents" && (
            <DocumentPanel
              mode={mode}
              projectId={p.id}
              organizationId={organizationId}
              onCandidate={(source, evidence, visual) => {
                const s = {
                  ...newScope(),
                  description: visual?.description || "Manual scope candidate",
                  ...(visual
                    ? {
                        room: visual.room,
                        quantity:
                          visual.quantity && visual.unit === "LF"
                            ? roundLinearFeet(visual.quantity)
                            : visual.quantity || "0",
                        unit: visual.unit || "EA",
                        notes:
                          `Proposed by visual model. Physical count: ${visual.physicalCount ?? "unknown"}. Furnished by: ${visual.furnishing ?? "Unknown"}. Installed by: ${visual.installation ?? "Unknown"}. Original quantity: ${visual.quantity ?? "unknown"} ${visual.unit ?? ""}. LF estimating quantities rounded to nearest 0.5 ft; midpoint rounds up. Quantity basis: ${visual.quantityBasis}. Dimensions: ${visual.dimensions}. Materials: ${visual.materials}. Finish: ${visual.finish}. Hardware: ${visual.hardware}. Review: ${visual.uncertainties.join("; ")}`.slice(
                            0,
                            2000,
                          ),
                      }
                    : {}),
                  source,
                  evidence,
                  components: [],
                };
                update(
                  { ...p, scope: [...p.scope, s] },
                  "Create evidence-backed scope candidate",
                );
                setSelected(s.id);
                setTab("Scope & estimate");
              }}
            />
          )}
          {tab === "Logistics" && (
            <div className="card">
              <h2>Delivery & installation</h2>
              <p>
                Enter round-trip miles and driver hours per trip. Installation
                hours are total person-hours, including handling, setup,
                scribing, supervision and punch work. Add detailed operations as
                scope components when needed; avoid double-counting.
              </p>
              <div className="fields">
                {Object.entries({
                  trips: "Delivery trips",
                  miles: "Round-trip miles / trip",
                  costPerMile: "Vehicle cost / mile ($)",
                  driverHours: "Driver hours / trip",
                  driverRate: "Burdened driver rate ($/hr)",
                  outsideQuote: "Outside delivery quote ($) — comparison only",
                  installHours: "Installation person-hours",
                  installRate: "Burdened installer rate ($/hr)",
                  crew: "Crew size",
                  hoursPerDay: "Productive hours / person-day",
                  actualCost: "Actual project cost ($) — internal",
                }).map(([k, label]) => (
                  <Field
                    key={k}
                    label={label}
                    value={p.logistics[k as keyof Project["logistics"]]}
                    onChange={(v) =>
                      update(
                        { ...p, logistics: { ...p.logistics, [k]: v } },
                        `Edit logistics ${k}`,
                      )
                    }
                  />
                ))}
              </div>
              {totals && (
                <div className="stats">
                  <div className="stat">
                    <span>Company delivery</span>
                    <strong>${money(totals.delivery)}</strong>
                  </div>
                  <div className="stat">
                    <span>Outside quote (not applied)</span>
                    <strong>${money(p.logistics.outsideQuote)}</strong>
                  </div>
                  <div className="stat">
                    <span>Installation budget</span>
                    <strong>${money(totals.installation)}</strong>
                  </div>
                  <div className="stat">
                    <span>Installation working days</span>
                    <strong>
                      {totals.installDays?.toString() || "Set crew capacity"}
                    </strong>
                  </div>
                </div>
              )}
              <p className="muted">
                Schedule is a capacity estimate, not a promised completion date.
                Record elevator, access, phasing and occupied-site constraints
                in the risk register.
              </p>
              {totals && (
                <p>
                  Actual minus estimate: ${money(totals.variance)}. Enter actual
                  cost when available; zero means no costs entered.
                </p>
              )}
            </div>
          )}
          {tab === "Commercial review" && (
            <CommercialPanel project={p} onChange={update} />
          )}
          {tab === "Qualifications" && (
            <div className="card">
              <h2>Make the boundaries explicit.</h2>
              <div className="fields two">
                {(
                  ["qualifications", "exclusions", "terms", "risks"] as const
                ).map((k) => (
                  <label key={k}>
                    {k === "risks"
                      ? "Internal risk / RFI register (not on proposal)"
                      : k.charAt(0).toUpperCase() + k.slice(1)}
                    <textarea
                      value={p[k]}
                      onChange={(e) =>
                        update({ ...p, [k]: e.target.value }, `Edit ${k}`)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
          {tab === "Proposal" && (
            <>
              <div className="no-print">
                <div className="actions">
                  <label>
                    Proposal version
                    <select
                      value={proposalVersion}
                      onChange={(e) =>
                        setProposalVersion(Number(e.target.value))
                      }
                    >
                      <option value={0}>Current draft (not issued)</option>
                      {p.proposals.map((v) => (
                        <option key={v.version} value={v.version}>
                          Issued version {v.version} · {v.issuedAt.slice(0, 10)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="button"
                    disabled={
                      !!calculationError ||
                      busy ||
                      (mode === "hosted" &&
                        p.proposals.length > persistedProposals)
                    }
                    onClick={issue}
                  >
                    Issue new version
                  </button>
                  <button
                    className="button secondary"
                    disabled={!preview || busy}
                    onClick={() => preview && pdf(preview)}
                  >
                    Download {proposalVersion ? "issued" : "draft"} PDF
                  </button>
                </div>
                {problems.length > 0 && (
                  <div className="error">
                    <strong>Resolve before issuing</strong>
                    <ul>
                      {problems.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p>
                  Issued versions are fixed snapshots. Later edits change the
                  draft. Save the project after issuing.
                </p>
              </div>
              {preview && (
                <article className="paper">
                  <p>
                    {proposalVersion ? "ISSUED PROPOSAL" : "DRAFT — NOT ISSUED"}{" "}
                    · V{preview.version}
                  </p>
                  <h2>{preview.company}</h2>
                  <h3>{preview.project}</h3>
                  <p>
                    Prepared for {preview.client}
                    <br />
                    {preview.address}
                  </p>
                  <table>
                    <thead>
                      <tr>
                        <th>Included scope</th>
                        <th>Room</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.scope.map((s, i) => (
                        <tr key={i}>
                          <td>{s.description}</td>
                          <td>{s.room}</td>
                          <td>
                            {s.quantity} {s.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="proposal-total">
                    Base bid · ${preview.sellingPrice} USD
                  </p>
                  {preview.commercial?.map((item, i) => (
                    <p key={i}>
                      {item.kind}: {item.description} · {item.quantity}{" "}
                      {item.unit} · ${item.price}{" "}
                      {item.kind === "Allowance"
                        ? "(included in base bid)"
                        : "(separate from base bid)"}
                    </p>
                  ))}
                  <h3>Qualifications</h3>
                  <p>{preview.qualifications}</p>
                  <h3>Exclusions</h3>
                  <p>{preview.exclusions}</p>
                  <h3>Terms</h3>
                  <p>{preview.terms}</p>
                  <p>{preview.taxStatement}</p>
                  <p>Accepted by: ____________________ Date: __________</p>
                </article>
              )}
            </>
          )}
          {tab === "History" && (
            <div className="card">
              <h2>Estimate history</h2>
              <p>
                Internal project export includes before and after values. Demo
                history is editable browser data; hosted saves also create
                database audit events.
              </p>
              {p.audit.length === 0 ? (
                <p>No edits yet.</p>
              ) : (
                [...p.audit].reverse().map((a, i) => (
                  <details key={i}>
                    <summary>
                      {new Date(a.at).toLocaleString()} · {a.action}
                    </summary>
                    <p>{a.actor}</p>
                    <pre className="log-entry">Before: {a.before}</pre>
                    <pre className="log-entry">After: {a.after}</pre>
                  </details>
                ))
              )}
            </div>
          )}
        </section>
      </fieldset>
      {mode === "hosted" && (
        <button
          className="text-button"
          onClick={async () => {
            await browserClient()?.auth.signOut();
            router.push("/login");
          }}
        >
          Sign out
        </button>
      )}
    </div>
  );
}
