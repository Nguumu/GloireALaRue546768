import type { CardLanguage, ID } from "./common";

/**
 * Closed set, not free text — the app relies on ordering these for filters
 * and Master Set completion checks.
 */
export const CARD_CONDITIONS = [
  "MINT",
  "NEAR_MINT",
  "EXCELLENT",
  "GOOD",
  "PLAYED",
  "POOR",
] as const;
export type CardCondition = (typeof CARD_CONDITIONS)[number];

export interface StorageLocation {
  id: ID;
  userId: ID;
  name: string;
  parentId: ID | null; // optional hierarchy: binder -> page -> slot
  createdAt: string;
}

/** One row per (user, printing, condition, language, foil-state) stack the user owns. */
export interface CollectionEntry {
  id: ID;
  userId: ID;
  cardPrintingId: ID;
  quantity: number;
  /** How many of `quantity` the user wants to keep; the rest are surplus/doubles. */
  keepQuantity: number;
  condition: CardCondition;
  purchasePriceMinor: number | null;
  purchaseDate: string | null;
  storageLocationId: ID | null;
  note: string | null;
  /** Surplus offered for trade when true (see doubles view, section 18). */
  availableForTrade: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GradingCompany {
  id: ID;
  code: string; // e.g. "PSA"
  name: string;
}

export interface GradedCard {
  id: ID;
  userId: ID;
  cardPrintingId: ID;
  gradingCompanyId: ID;
  grade: string; // e.g. "9.5" — text to allow half-grades/company-specific scales
  certificationNumber: string | null;
  purchasePriceMinor: number | null;
  estimatedValueMinor: number | null;
  gradedDate: string | null;
  createdAt: string;
}

export interface SealedProductEntry {
  id: ID;
  userId: ID;
  productId: ID;
  quantity: number;
  language: CardLanguage;
  condition: CardCondition;
  purchasePriceMinor: number | null;
  currentPriceMinor: number | null;
  purchaseDate: string | null;
  note: string | null;
  createdAt: string;
}

/** A user-defined named list of target cards, e.g. "Cartes manquantes OP05". */
export interface CollectionList {
  id: ID;
  userId: ID;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface CollectionListItem {
  id: ID;
  listId: ID;
  cardId: ID;
  targetQuantity: number;
  note: string | null;
}

export interface WishlistItem {
  id: ID;
  userId: ID;
  cardPrintingId: ID;
  quantity: number;
  conditionMin: CardCondition;
  priceMaxMinor: number | null;
  note: string | null;
  createdAt: string;
}

export interface PriceAlert {
  id: ID;
  userId: ID;
  cardPrintingId: ID;
  condition: CardCondition;
  targetPriceMinor: number;
  active: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
}

/** Derived, not stored: computed by joining CollectionEntry + market price. */
export interface DoublesRow {
  cardPrintingId: ID;
  totalQuantity: number;
  keepQuantity: number;
  surplus: number;
  surplusValueMinor: number | null;
}
