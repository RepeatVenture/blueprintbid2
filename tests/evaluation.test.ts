import { expect, it } from "vitest";
import { scoreEvaluation } from "../src/lib/evaluation";
const row = {
  id: "1",
  room: "101",
  description: "Base cabinet",
  physicalCount: "2",
  estimatingQuantity: "5.5",
  unit: "LF",
  printedDimensions: "",
  finish: "PL1",
  hardware: "",
  responsibility: "Unknown",
  source: { document: "synthetic", page: 1, reference: "A.1" },
  status: "Confirmed",
  notes: "",
};
it("scores count separately from decimal estimating quantity", () => {
  const score = scoreEvaluation([
    {
      reference: row,
      predictions: [
        { ...row, physicalCount: "3", estimatingQuantity: "5.5000" },
      ],
      matchStatus: "Reviewed",
    },
  ]);
  expect(score.physicalCountErrors).toBe(1);
  expect(score.estimatingQuantityErrors).toBe(0);
});
it("does not score unreviewed answers as truth", () => {
  expect(
    scoreEvaluation([
      {
        reference: { ...row, status: "Unresolved" },
        predictions: [],
        matchStatus: "Reviewed",
      },
    ]).scored,
  ).toBe(0);
});
it("reports missing and duplicated matches", () => {
  const score = scoreEvaluation([
    { reference: row, predictions: [], matchStatus: "Reviewed" },
    { reference: row, predictions: [row, row], matchStatus: "Reviewed" },
  ]);
  expect(score.missing).toBe(1);
  expect(score.duplicatePredictions).toBe(1);
});
