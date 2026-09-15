import type { CardCondition, CardLanguage, CurrencyCode } from "@tcg/types";

export interface PriceQuery {
  cardNumber: string;
  setCode: string;
  language: CardLanguage;
  condition: CardCondition;
  isFoil: boolean;
}

export interface PriceQuote {
  priceMinor: number;
  currency: CurrencyCode;
}

/**
 * Abstraction over a single price source. Only sources with an authorized
 * API/feed may implement this (section 27 explicitly forbids unauthorized
 * scraping) — no implementation ships in the MVP; wire one up by
 * implementing this interface against a licensed marketplace API and
 * registering it in the price-sync job.
 */
export interface PriceProvider {
  readonly marketplace: string;
  fetchPrice(query: PriceQuery): Promise<PriceQuote | null>;
}
