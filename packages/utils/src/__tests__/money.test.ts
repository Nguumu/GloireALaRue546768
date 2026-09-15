import { describe, expect, it } from "vitest";
import { addMoney, formatMoney, toMinorUnits } from "../money";

describe("money (integer minor units, never floats — section 43)", () => {
  it("formats EUR minor units as currency", () => {
    expect(formatMoney({ amountMinor: 4550, currency: "EUR" })).toContain("45,50");
  });

  it("adds two amounts of the same currency", () => {
    expect(addMoney({ amountMinor: 100, currency: "EUR" }, { amountMinor: 250, currency: "EUR" })).toEqual({
      amountMinor: 350,
      currency: "EUR",
    });
  });

  it("throws when adding mismatched currencies", () => {
    expect(() =>
      addMoney({ amountMinor: 100, currency: "EUR" }, { amountMinor: 100, currency: "USD" }),
    ).toThrow();
  });

  it("converts a decimal amount to integer minor units without float drift", () => {
    expect(toMinorUnits(19.99)).toBe(1999);
    expect(toMinorUnits(0.1 + 0.2)).toBe(30); // classic float trap — must round correctly
  });
});
