/**
 * Cross-cutting value types shared by every domain module.
 */

/** ISO-ish currency codes supported at launch. Extend freely — nothing else assumes this is closed. */
export type CurrencyCode = "EUR" | "USD" | "GBP" | "JPY";

/** UI/content locales. Distinct from `CardLanguage` (a card's printed language). */
export type Locale = "fr" | "en";

/** Language a physical card is printed in. Distinct from `Locale` (the app's UI language). */
export type CardLanguage = "EN" | "FR" | "JP" | "DE" | "IT" | "ES";

/**
 * Monetary amounts are always stored/passed as integer minor units (cents),
 * never as floats, to avoid rounding drift. See @tcg/utils `formatMoney`.
 */
export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export type UserRole = "USER" | "MODERATOR" | "ADMIN";

export type ID = string;
