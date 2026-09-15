import type { CardCondition } from "./collection";
import type { CardLanguage, CurrencyCode, ID } from "./common";

/** A daily snapshot, not a tick stream — enough for the 7d/30d/3m/1y chart. */
export interface MarketPrice {
  id: ID;
  cardPrintingId: ID;
  marketplace: string; // adapter key, see PriceProvider
  language: CardLanguage;
  condition: CardCondition;
  priceMinor: number;
  currency: CurrencyCode;
  capturedAt: string; // date, one row per day per (printing, marketplace, language, condition)
}

export type TradeListingType = "SELL" | "BUY" | "TRADE";
export type TradeListingStatus = "OPEN" | "CLOSED";

export interface TradeListing {
  id: ID;
  userId: ID;
  cardPrintingId: ID;
  type: TradeListingType;
  quantity: number;
  condition: CardCondition;
  language: CardLanguage;
  priceMinor: number | null;
  comment: string | null;
  status: TradeListingStatus;
  createdAt: string;
}
