import { demoProject } from "../src/lib/demo.ts";
import { customerProposal } from "../src/lib/estimate.ts";
import { writeFile } from "node:fs/promises";
const base = demoProject();
base.scope[0].status = "Confirmed";
base.scope[0].responsibility = "Included by us";
const margin = structuredClone(base);
margin.pricing = {
  mode: "margin",
  rate: "32.5",
  overhead: "11.3",
  contingency: "4.2",
  tax: "7.75",
};
margin.scope[0].components[0].unitCost = "82.005";
margin.scope[0].quantity = "2.75";
const offers = structuredClone(margin);
offers.commercial = [
  {
    id: "a",
    kind: "Allowance",
    description: "Glass",
    quantity: "2.5",
    unit: "EA",
    unitCost: "130.005",
  },
  {
    id: "b",
    kind: "Add alternate",
    description: "Upgrade",
    quantity: "1",
    unit: "LS",
    unitCost: "300",
  },
  {
    id: "c",
    kind: "Deduct alternate",
    description: "Omit trim",
    quantity: "1",
    unit: "LS",
    unitCost: "75",
  },
  {
    id: "d",
    kind: "Unit price",
    description: "Panel",
    quantity: "1",
    unit: "SF",
    unitCost: "12.5",
  },
];
await writeFile(
  "fixtures/estimate-cases.json",
  JSON.stringify(
    [base, margin, offers].map((project) => ({
      project,
      expected: customerProposal(project, 1, "2026-09-09", true),
    })),
  ),
);
