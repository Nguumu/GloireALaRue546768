import type { CurrencyCode, Money } from "@tcg/types";

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  EUR: "fr-FR",
  USD: "en-US",
  GBP: "en-GB",
  JPY: "ja-JP",
};

/**
 * Money is always minor units (cents) — never a float (section 43). JPY has
 * no minor unit in real life, but we still store/compare it as an integer
 * for consistency; Intl handles the display rounding.
 */
export function formatMoney(money: Money): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[money.currency], {
    style: "currency",
    currency: money.currency,
  }).format(money.amountMinor / 100);
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add different currencies: ${a.currency} vs ${b.currency}`);
  }
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}
