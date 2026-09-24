import { z } from "zod";
import Decimal from "decimal.js";
const quantity = z
  .string()
  .regex(/^\d{1,9}(\.\d{1,4})?$/)
  .nullable();
export const referenceRowSchema = z.object({
  id: z.string().min(1),
  room: z.string(),
  description: z.string().min(1),
  physicalCount: quantity,
  estimatingQuantity: quantity,
  unit: z.enum(["EA", "LF", "SF", "LS"]).nullable(),
  printedDimensions: z.string(),
  finish: z.string(),
  hardware: z.string(),
  responsibility: z.string(),
  source: z.object({
    document: z.string().min(1),
    page: z.number().int().positive(),
    reference: z.string(),
  }),
  status: z.enum(["Needs review", "Confirmed", "Unresolved"]),
  notes: z.string(),
});
export const evaluationCaseSchema = z.object({
  reference: referenceRowSchema,
  // Matching is explicitly adjudicated; fuzzy descriptions must not silently decide identity.
  predictions: z.array(referenceRowSchema),
  matchStatus: z.enum(["Reviewed", "Unresolved"]),
});
export function scoreEvaluation(input: unknown) {
  const cases = z.array(evaluationCaseSchema).parse(input);
  const result = {
    scored: 0,
    unresolved: 0,
    missing: 0,
    duplicatePredictions: 0,
    physicalCountErrors: 0,
    estimatingQuantityErrors: 0,
    unitErrors: 0,
    finishErrors: 0,
  };
  for (const entry of cases) {
    if (
      entry.matchStatus !== "Reviewed" ||
      entry.reference.status !== "Confirmed"
    ) {
      result.unresolved++;
      continue;
    }
    result.scored++;
    if (!entry.predictions.length) {
      result.missing++;
      continue;
    }
    result.duplicatePredictions += Math.max(0, entry.predictions.length - 1);
    if (entry.predictions.length !== 1) continue;
    const predicted = entry.predictions[0];
    const reference = entry.reference;
    for (const [field, counter] of [
      ["physicalCount", "physicalCountErrors"],
      ["estimatingQuantity", "estimatingQuantityErrors"],
    ] as const) {
      if (
        reference[field] !== null &&
        (predicted[field] === null ||
          !new Decimal(reference[field]).eq(predicted[field]!))
      )
        result[counter]++;
    }
    if (reference.unit !== null && reference.unit !== predicted.unit)
      result.unitErrors++;
    if (reference.finish && reference.finish !== predicted.finish)
      result.finishErrors++;
  }
  return {
    ...result,
    limitations:
      "Reviewed matches only. No automatic identity matching, finish aliases, dimension interpretation, extra-item scoring or overall accuracy percentage.",
  };
}
