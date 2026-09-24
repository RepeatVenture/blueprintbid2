import Decimal from "decimal.js";
/** Estimating footage only; never use for fabrication dimensions or physical counts. */
export function roundLinearFeet(feet: string): string {
  const value = new Decimal(feet);
  if (!value.isFinite() || value.isNegative())
    throw new Error("Footage must be finite and nonnegative");
  return value
    .mul(2)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .div(2)
    .toFixed();
}
