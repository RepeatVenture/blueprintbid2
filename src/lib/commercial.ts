import { z } from "zod";
// Independent schema avoids a model/engine circular dependency.
const numeric = z.string().regex(/^\d{1,9}(\.\d{1,4})?$/);
const text = z.string().max(2000);
export const commercialSchema = z.object({
  id: z.string(),
  kind: z.enum([
    "Allowance",
    "Add alternate",
    "Deduct alternate",
    "Unit price",
  ]),
  description: text,
  quantity: numeric,
  unit: z.string().max(30),
  unitCost: numeric,
});
export const quoteSchema = z.object({
  id: z.string(),
  vendor: text,
  scope: text,
  base: numeric,
  freight: numeric,
  tax: numeric,
  exclusions: text,
  expires: z.string().max(30),
  leadDays: numeric,
  status: z.enum(["Requested", "Received", "Selected", "Expired"]),
});
export const riskSchema = z.object({
  id: z.string(),
  description: text,
  source: text,
  likelihood: z.enum(["Low", "Medium", "High"]),
  impact: z.enum(["Low", "Medium", "High"]),
  exposure: numeric,
  owner: text,
  treatment: z.enum([
    "Clarification",
    "RFI",
    "Assumption",
    "Exclusion",
    "Allowance",
    "Contingency",
    "Firm quote",
    "Bid / no-bid",
  ]),
  status: z.enum(["Open", "Resolved", "Accepted"]),
  resolution: text,
});
export type CommercialItem = z.infer<typeof commercialSchema>;
export type VendorQuote = z.infer<typeof quoteSchema>;
export type Risk = z.infer<typeof riskSchema>;
