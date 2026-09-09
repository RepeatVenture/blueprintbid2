import type { Component, Project, Scope } from "./model";
export const uid = () => crypto.randomUUID();
export function baseComponents(): Component[] {
  return [
    {
      id: uid(),
      name: "3/4 in. prefinished panel — example",
      category: "Material",
      quantity: "1.4",
      unit: "sheet",
      unitCost: "82",
      waste: "12",
      taxable: true,
    },
    {
      id: uid(),
      name: "Hinges, plates and pulls — example",
      category: "Hardware",
      quantity: "1",
      unit: "set",
      unitCost: "42",
      waste: "0",
      taxable: true,
    },
    {
      id: uid(),
      name: "Cut, edge, bore and assemble — example",
      category: "Labor",
      quantity: "3.5",
      unit: "hour",
      unitCost: "48",
      waste: "0",
      taxable: false,
    },
    {
      id: uid(),
      name: "Finish exposed surfaces — example",
      category: "Finish",
      quantity: "0.8",
      unit: "hour",
      unitCost: "52",
      waste: "0",
      taxable: false,
    },
  ];
}
export function newScope(): Scope {
  return {
    id: uid(),
    description: "Two-door base cabinet",
    room: "101 / Break room",
    quantity: "1",
    unit: "EA",
    status: "Needs review",
    responsibility: "Unknown",
    source: "",
    evidence: "",
    notes: "",
    components: baseComponents(),
  };
}
export function demoProject(): Project {
  return {
    commercial: [],
    vendorQuotes: [],
    riskRegister: [],
    revision: 0,
    id: uid(),
    name: "Juniper Studio · Tenant improvement",
    client: "Example Design Group (synthetic)",
    company: "Your Millwork Company",
    address: "Sample project — no real address",
    dueDate: "",
    status: "Estimating",
    scope: [
      {
        ...newScope(),
        quantity: "6",
        source: "Synthetic drawing A-501, rev 1, page 1 / elevation 2",
        evidence:
          "Six base cabinets in break room. Finish and field dimensions require confirmation.",
      },
    ],
    pricing: {
      mode: "markup",
      rate: "25",
      overhead: "10",
      contingency: "5",
      tax: "0",
    },
    qualifications:
      "Field dimensions and finish samples subject to approval before fabrication. One continuous delivery and installation sequence assumed.",
    exclusions:
      "Plumbing and electrical connections. Wall blocking and substrate repair by others.",
    terms:
      "Example terms — replace before use: 30% deposit, 60% before delivery, 10% at substantial completion. Quote valid for 30 days.",
    risks:
      "Confirm finish selection and elevator access. Synthetic examples are not production standards.",
    logistics: {
      trips: "2",
      miles: "40",
      costPerMile: "1.25",
      driverHours: "2",
      driverRate: "38",
      outsideQuote: "650",
      installHours: "32",
      installRate: "56",
      crew: "2",
      hoursPerDay: "8",
      actualCost: "0",
    },
    audit: [],
    proposals: [],
  };
}
