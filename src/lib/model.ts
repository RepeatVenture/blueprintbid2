import { commercialSchema, quoteSchema, riskSchema } from "./commercial.ts";
import { z } from "zod";
export const amount = z
  .string()
  .regex(
    /^\d{1,9}(\.\d{1,4})?$/,
    "Enter a nonnegative decimal with at most four decimal places",
  );
const percent = amount.refine((v) => Number(v) <= 100, "Maximum 100%");
const text = z.string().max(2000);
export const componentSchema = z.object({
  id: z.string().max(100),
  name: text,
  category: z.enum([
    "Material",
    "Hardware",
    "Labor",
    "Finish",
    "Subcontract",
    "Delivery",
    "Installation",
    "Engineering",
  ]),
  quantity: amount,
  unit: z.string().max(30),
  unitCost: amount,
  waste: percent,
  taxable: z.boolean(),
});
export const scopeSchema = z.object({
  id: z.string().max(100),
  description: text,
  room: text,
  quantity: amount,
  unit: z.string().max(30),
  status: z.enum([
    "Needs review",
    "Confirmed",
    "Missing information",
    "Conflict detected",
    "Excluded",
  ]),
  responsibility: z.enum([
    "Included by us",
    "Furnished by others / installed by us",
    "Coordinated only",
    "Excluded",
    "Unknown",
  ]),
  source: text,
  evidence: text,
  notes: text,
  components: z.array(componentSchema).max(100),
});
export const projectSchema = z.object({
  commercial: z.array(commercialSchema).max(100).default([]),
  vendorQuotes: z.array(quoteSchema).max(100).default([]),
  riskRegister: z.array(riskSchema).max(100).default([]),
  revision: z.number().int().nonnegative().default(0),
  id: z.string().max(100),
  name: z.string().min(1).max(200),
  client: text,
  address: text,
  dueDate: z.string().max(30),
  company: text,
  status: z.enum(["Estimating", "Issued", "Awarded"]),
  scope: z.array(scopeSchema).max(300),
  pricing: z.object({
    mode: z.enum(["markup", "margin"]),
    rate: percent,
    overhead: percent,
    contingency: percent,
    tax: percent,
  }),
  qualifications: text,
  exclusions: text,
  terms: text,
  risks: text,
  logistics: z.object({
    trips: amount,
    miles: amount,
    costPerMile: amount,
    driverHours: amount,
    driverRate: amount,
    outsideQuote: amount,
    installHours: amount,
    installRate: amount,
    crew: amount,
    hoursPerDay: amount,
    actualCost: amount,
  }),
  audit: z
    .array(
      z.object({
        at: z.string(),
        actor: z.string(),
        action: z.string(),
        before: z.string(),
        after: z.string(),
      }),
    )
    .max(10000),
  proposals: z
    .array(
      z.object({
        version: z.number().int().positive(),
        issuedAt: z.string(),
        snapshot: z.string(),
      }),
    )
    .max(100),
});
export type Project = z.infer<typeof projectSchema>;
export type Scope = z.infer<typeof scopeSchema>;
export type Component = z.infer<typeof componentSchema>;
