import Decimal from "decimal.js";
import { projectSchema } from "./model.ts";
import type { Project, Component } from "./model.ts";
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export const D = (v: Decimal.Value) => new Decimal(v);
export const money = (v: Decimal.Value) => D(v).toDecimalPlaces(2).toFixed(2);
export function componentCost(c: Component) {
  return D(c.quantity)
    .mul(c.unitCost)
    .mul(D(1).plus(D(c.waste).div(100)))
    .toDecimalPlaces(2);
}
export function calculate(input: Project) {
  const p = projectSchema.parse(input);
  if (p.pricing.mode === "margin" && D(p.pricing.rate).gte(100))
    throw new Error("Target margin must be below 100%.");
  const lines = p.scope
    .filter((s) => s.status !== "Excluded" && s.responsibility !== "Excluded")
    .map((s) => ({
      id: s.id,
      cost: s.components
        .reduce((n, c) => n.plus(componentCost(c)), D(0))
        .mul(s.quantity)
        .toDecimalPlaces(2),
      taxable: s.components
        .filter((c) => c.taxable)
        .reduce((n, c) => n.plus(componentCost(c)), D(0))
        .mul(s.quantity)
        .toDecimalPlaces(2),
    }));
  const l = p.logistics;
  const delivery = D(l.trips)
    .mul(D(l.miles).mul(l.costPerMile).plus(D(l.driverHours).mul(l.driverRate)))
    .toDecimalPlaces(2);
  const installation = D(l.installHours).mul(l.installRate).toDecimalPlaces(2);
  const allowances = p.commercial
    .filter((i) => i.kind === "Allowance")
    .reduce(
      (sum, i) => sum.plus(D(i.quantity).mul(i.unitCost).toDecimalPlaces(2)),
      D(0),
    );
  const direct = lines
    .reduce((n, l) => n.plus(l.cost), D(0))
    .plus(delivery)
    .plus(installation)
    .plus(allowances);
  const overhead = direct.mul(p.pricing.overhead).div(100).toDecimalPlaces(2);
  const contingency = direct
    .plus(overhead)
    .mul(p.pricing.contingency)
    .div(100)
    .toDecimalPlaces(2);
  const tax = lines
    .reduce((n, l) => n.plus(l.taxable), D(0))
    .mul(p.pricing.tax)
    .div(100)
    .toDecimalPlaces(2);
  const cost = direct.plus(overhead).plus(contingency).plus(tax);
  const sell = (
    p.pricing.mode === "markup"
      ? cost.mul(D(1).plus(D(p.pricing.rate).div(100)))
      : cost.div(D(1).minus(D(p.pricing.rate).div(100)))
  ).toDecimalPlaces(2);
  return {
    lines,
    allowances,
    direct,
    delivery,
    installation,
    overhead,
    contingency,
    tax,
    cost,
    sell,
    profit: sell.minus(cost),
    margin: sell.isZero() ? D(0) : sell.minus(cost).div(sell).mul(100),
    installDays: D(l.crew).mul(l.hoursPerDay).gt(0)
      ? D(l.installHours).div(D(l.crew).mul(l.hoursPerDay)).ceil()
      : null,
    variance: D(l.actualCost).minus(cost),
  };
}
export function warnings(p: Project) {
  const out: string[] = [];
  if (
    !p.scope.some(
      (s) => s.status !== "Excluded" && s.responsibility !== "Excluded",
    )
  )
    out.push("Add at least one included scope item.");
  for (const s of p.scope.filter(
    (s) => s.status !== "Excluded" && s.responsibility !== "Excluded",
  )) {
    if (s.status !== "Confirmed")
      out.push(`${s.description}: scope needs confirmation.`);
    if (s.responsibility === "Unknown")
      out.push(`${s.description}: responsibility is unknown.`);
    if (
      !s.components.length ||
      D(s.quantity).isZero() ||
      s.components.every((c) => componentCost(c).isZero())
    )
      out.push(`${s.description}: quantity or component pricing is missing.`);
  }
  for (const risk of p.riskRegister) {
    if (risk.status === "Open" && risk.impact === "High")
      out.push(
        `${risk.description}: resolve or explicitly accept this high-impact risk.`,
      );
  }
  for (const risk of p.riskRegister) {
    if (risk.status !== "Open" && !risk.resolution.trim())
      out.push(
        `${risk.description}: record a resolution or acceptance reason.`,
      );
  }
  if (!p.terms.trim()) out.push("Add payment terms and quote validity.");
  return out;
}
// Explicit allowlist: never serialize a Project as a customer proposal.
export function customerProposal(
  p: Project,
  version: number,
  issuedAt: string,
  issued = false,
) {
  const totals = calculate(p);
  return {
    version,
    issuedAt,
    documentStatus: issued ? "Issued" : "Draft — not issued",
    company: p.company,
    project: p.name,
    client: p.client,
    address: p.address,
    scope: p.scope
      .filter((s) => s.status !== "Excluded" && s.responsibility !== "Excluded")
      .map((s) => ({
        description: s.description,
        room: s.room,
        quantity: s.quantity,
        unit: s.unit,
      })),
    sellingPrice: money(totals.sell),
    commercial: p.commercial.map((i) => {
      // Allowances enter the base cost; alternates and unit prices are separate offers.
      const base = D(i.quantity).mul(i.unitCost).toDecimalPlaces(2);
      const loaded = base
        .mul(D(1).plus(D(p.pricing.overhead).div(100)))
        .toDecimalPlaces(2)
        .mul(D(1).plus(D(p.pricing.contingency).div(100)))
        .toDecimalPlaces(2);
      const sell =
        p.pricing.mode === "markup"
          ? loaded.mul(D(1).plus(D(p.pricing.rate).div(100)))
          : loaded.div(D(1).minus(D(p.pricing.rate).div(100)));
      return {
        kind: i.kind,
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        price: money(sell),
      };
    }),
    qualifications: p.qualifications,
    exclusions: p.exclusions,
    terms: p.terms,
    taxStatement:
      "Price includes the estimator-entered tax allowance. Tax treatment must be confirmed for this project.",
  };
}
export function issueProposal(
  p: Project,
  now = new Date().toISOString(),
): Project {
  const problems = warnings(p);
  if (problems.length) throw new Error(problems.join(" "));
  const version = p.proposals.length + 1;
  return {
    ...p,
    status: "Issued",
    proposals: [
      ...p.proposals,
      {
        version,
        issuedAt: now,
        snapshot: JSON.stringify(customerProposal(p, version, now, true)),
      },
    ],
  };
}
export function sheetYield(
  partWidth: string,
  partHeight: string,
  quantity: string,
  sheetWidth = "48",
  sheetHeight = "96",
  kerf = "0.125",
) {
  const w = D(partWidth),
    h = D(partHeight),
    q = D(quantity),
    k = D(kerf);
  if (w.lte(0) || h.lte(0) || q.lt(0) || k.lt(0))
    throw new Error("Invalid part dimensions or quantity");
  const per = D(sheetWidth)
    .plus(k)
    .div(w.plus(k))
    .floor()
    .mul(D(sheetHeight).plus(k).div(h.plus(k)).floor());
  if (per.lte(0))
    throw new Error(
      "Part does not fit the sheet in the selected grain direction",
    );
  return {
    partsPerSheet: per.toFixed(0),
    sheets: q.div(per).ceil().toFixed(0),
  };
}
