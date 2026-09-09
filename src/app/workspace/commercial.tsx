"use client";
import { useState } from "react";
import { Project } from "@/lib/model";
import { CommercialItem, VendorQuote, Risk } from "@/lib/commercial";
import { D, money } from "@/lib/estimate";
import { uid } from "@/lib/demo";
function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </label>
  );
}
export function CommercialPanel({
  project: p,
  onChange,
}: {
  project: Project;
  onChange: (next: Project, action: string) => void;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const edit = (id: string, patch: Partial<CommercialItem>) =>
    onChange(
      {
        ...p,
        commercial: p.commercial.map((i) =>
          i.id === id ? { ...i, ...patch } : i,
        ),
      },
      "Edit allowance / alternate",
    );
  const quote = (id: string, patch: Partial<VendorQuote>) =>
    onChange(
      {
        ...p,
        vendorQuotes: p.vendorQuotes.map((i) =>
          i.id === id ? { ...i, ...patch } : i,
        ),
      },
      "Edit vendor quote",
    );
  const risk = (id: string, patch: Partial<Risk>) =>
    onChange(
      {
        ...p,
        riskRegister: p.riskRegister.map((i) =>
          i.id === id ? { ...i, ...patch } : i,
        ),
      },
      "Edit risk register",
    );
  return (
    <>
      <div className="card">
        <h2>Allowances, alternates & unit prices</h2>
        <p>
          Allowances enter the base estimate as cost, then receive the project
          overhead, contingency and pricing rate. Add/deduct alternates and unit
          prices are separate offers and do not change the base bid. Deduct
          amounts are entered as positive values. Enter a quantity of 1 for a
          quoted unit price. Include any purchase tax within unit cost; these
          items do not receive the component tax allowance.
        </p>
        <button
          className="button secondary"
          onClick={() =>
            onChange(
              {
                ...p,
                commercial: [
                  ...p.commercial,
                  {
                    id: uid(),
                    kind: "Allowance",
                    description: "New allowance",
                    quantity: "1",
                    unit: "LS",
                    unitCost: "0",
                  },
                ],
              },
              "Add commercial item",
            )
          }
        >
          Add allowance / alternate
        </button>
        {p.commercial.map((i) => (
          <div className="fields card" key={i.id} style={{ marginTop: 15 }}>
            <Select
              label="Kind"
              value={i.kind}
              options={[
                "Allowance",
                "Add alternate",
                "Deduct alternate",
                "Unit price",
              ]}
              onChange={(v) =>
                edit(i.id, { kind: v as CommercialItem["kind"] })
              }
            />
            <TextInput
              label="Customer description"
              value={i.description}
              onChange={(v) => edit(i.id, { description: v })}
            />
            <TextInput
              label="Quantity"
              value={i.quantity}
              onChange={(v) => edit(i.id, { quantity: v })}
            />
            <TextInput
              label="Unit"
              value={i.unit}
              onChange={(v) => edit(i.id, { unit: v })}
            />
            <TextInput
              label="Unit cost ($), internal"
              value={i.unitCost}
              onChange={(v) => edit(i.id, { unitCost: v })}
            />
            <button
              className="text-button"
              onClick={() =>
                onChange(
                  {
                    ...p,
                    commercial: p.commercial.filter((x) => x.id !== i.id),
                  },
                  "Remove commercial item",
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h2>Vendor quotation comparison</h2>
        <p role="status">{copyStatus}</p>
        <p>
          Compare complete scope, freight, tax, exclusions, expiration and lead
          time. Selecting a quote does not automatically price it: enter its
          landed cost as a subcontract component in the relevant assembly to
          avoid silently changing the estimate.
        </p>
        <button
          className="button secondary"
          onClick={() =>
            onChange(
              {
                ...p,
                vendorQuotes: [
                  ...p.vendorQuotes,
                  {
                    id: uid(),
                    vendor: "New vendor",
                    scope: "",
                    base: "0",
                    freight: "0",
                    tax: "0",
                    exclusions: "",
                    expires: "",
                    leadDays: "0",
                    status: "Requested",
                  },
                ],
              },
              "Add vendor request",
            )
          }
        >
          Add vendor quote / RFQ
        </button>
        {p.vendorQuotes.map((q) => {
          let total = "Check amounts";
          try {
            total = "$" + money(D(q.base).plus(q.freight).plus(q.tax));
          } catch {}
          return (
            <div className="card" key={q.id} style={{ marginTop: 15 }}>
              <h3>
                {q.vendor} · Landed quote {total}
              </h3>
              <div className="fields">
                {Object.entries({
                  vendor: "Vendor / contact",
                  scope: "Scope requested / quoted",
                  base: "Base quote ($)",
                  freight: "Freight ($)",
                  tax: "Tax ($)",
                  exclusions: "Exclusions / scope gaps",
                  expires: "Expiration (YYYY-MM-DD)",
                  leadDays: "Lead time (days)",
                }).map(([key, label]) => (
                  <TextInput
                    key={key}
                    label={label}
                    value={q[key as keyof VendorQuote]}
                    onChange={(v) => quote(q.id, { [key]: v })}
                  />
                ))}
                <Select
                  label="Quote status"
                  value={q.status}
                  options={["Requested", "Received", "Selected", "Expired"]}
                  onChange={(v) =>
                    quote(q.id, { status: v as VendorQuote["status"] })
                  }
                />
              </div>
              <button
                className="text-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `RFQ — ${p.name}\nVendor: ${q.vendor}\nScope: ${q.scope}\nBid due: ${p.dueDate || "Confirm due date"}\nPlease identify freight, taxes, exclusions, lead time, validity and scope responsibilities separately.`,
                    );
                    setCopyStatus(
                      "RFQ copied. Share it using your own email workflow.",
                    );
                  } catch {
                    setCopyStatus(
                      "Clipboard unavailable. Select and copy the RFQ fields manually.",
                    );
                  }
                }}
              >
                Copy RFQ text (does not send)
              </button>
            </div>
          );
        })}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h2>Risk & RFI register</h2>
        <p>
          Open high-impact risks block proposal issuance. An estimator must
          resolve them or explicitly accept them with a documented treatment.
          These records stay internal.
        </p>
        <button
          className="button secondary"
          onClick={() =>
            onChange(
              {
                ...p,
                riskRegister: [
                  ...p.riskRegister,
                  {
                    id: uid(),
                    description: "New risk / RFI",
                    source: "",
                    likelihood: "Medium",
                    impact: "Medium",
                    exposure: "0",
                    owner: "",
                    treatment: "Clarification",
                    status: "Open",
                    resolution: "",
                  },
                ],
              },
              "Add risk",
            )
          }
        >
          Add risk / RFI
        </button>
        {p.riskRegister.map((r) => (
          <div className="fields card" key={r.id} style={{ marginTop: 15 }}>
            {Object.entries({
              description: "Risk / RFI question",
              source: "Source reference",
              exposure: "Cost exposure ($), comparison only",
              owner: "Responsible person",
              resolution: "Resolution / acceptance reason",
            }).map(([key, label]) => (
              <TextInput
                key={key}
                label={label}
                value={r[key as keyof Risk]}
                onChange={(v) => risk(r.id, { [key]: v })}
              />
            ))}
            <Select
              label="Likelihood"
              value={r.likelihood}
              options={["Low", "Medium", "High"]}
              onChange={(v) =>
                risk(r.id, { likelihood: v as Risk["likelihood"] })
              }
            />
            <Select
              label="Impact"
              value={r.impact}
              options={["Low", "Medium", "High"]}
              onChange={(v) => risk(r.id, { impact: v as Risk["impact"] })}
            />
            <Select
              label="Treatment"
              value={r.treatment}
              options={[
                "Clarification",
                "RFI",
                "Assumption",
                "Exclusion",
                "Allowance",
                "Contingency",
                "Firm quote",
                "Bid / no-bid",
              ]}
              onChange={(v) =>
                risk(r.id, { treatment: v as Risk["treatment"] })
              }
            />
            <Select
              label="Risk status"
              value={r.status}
              options={["Open", "Resolved", "Accepted"]}
              onChange={(v) => risk(r.id, { status: v as Risk["status"] })}
            />
          </div>
        ))}
      </div>
    </>
  );
}
