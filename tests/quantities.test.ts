import { expect, it } from "vitest";
import { roundLinearFeet } from "../src/lib/quantities";
it("rounds footage to half feet including exact ties and boundaries", () => {
  for (const [input, expected] of [
    ["4.1666667", "4"],
    ["2.6666667", "2.5"],
    ["4.25", "4.5"],
    ["4.249999", "4"],
    ["4.75", "5"],
    ["7", "7"],
    ["0", "0"],
  ])
    expect(roundLinearFeet(input)).toBe(expected);
});
it("rejects negative and nonfinite footage", () => {
  for (const value of ["-1", "NaN", "Infinity", "invalid"])
    expect(() => roundLinearFeet(value)).toThrow();
});
