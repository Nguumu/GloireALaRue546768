import type { CardLanguage, ID } from "./common";

/**
 * A trading card game. One Piece Card Game is the only fully wired game in
 * the MVP; the schema and types are generic so Pokemon/MTG/etc. can be
 * added as data + a new TCGAdapter, without touching these shapes.
 */
export interface Game {
  id: ID;
  code: string; // e.g. "one-piece"
  name: string;
  isActive: boolean;
  createdAt: string;
}

export type SetType =
  | "booster"
  | "starter_deck"
  | "promo"
  | "premium"
  | "event"
  | "special";

export interface CardSet {
  id: ID;
  gameId: ID;
  code: string; // e.g. "OP01"
  name: string;
  releaseDate: string | null;
  imageUrl: string | null;
  language: CardLanguage;
  setType: SetType;
  createdAt: string;
}

export type CardCategory = "LEADER" | "CHARACTER" | "EVENT" | "STAGE" | "OTHER";

/**
 * Game-specific attributes that don't generalize cleanly across TCGs live
 * here instead of as top-level columns. Narrow with the game's code.
 */
export interface OnePieceCardMetadata {
  game: "one-piece";
  life?: number; // leader only
  blockIcon?: string;
}

export type CardMetadata = OnePieceCardMetadata | Record<string, unknown>;

/**
 * A canonical card "template" — the rules identity shared by every physical
 * printing of it (see CardPrinting for the physical/illustration variant).
 */
export interface Card {
  id: ID;
  gameId: ID;
  cardNumber: string; // e.g. "OP01-001"
  name: string;
  character: string | null;
  colors: string[];
  category: CardCategory;
  rarity: string;
  cost: number | null;
  power: number | null;
  counter: number | null;
  attribute: string | null;
  traits: string[];
  text: string | null;
  isLeader: boolean;
  primarySetId: ID | null;
  metadata: CardMetadata;
  createdAt: string;
  updatedAt: string;
}

/**
 * One physical print of a Card: a specific set, language, illustration and
 * finish. "Toutes les versions" on a card page lists these.
 */
export interface CardPrinting {
  id: ID;
  cardId: ID;
  setId: ID;
  language: CardLanguage;
  illustrationLabel: string | null; // e.g. "Alternate Art", "Manga Rare"
  isFoil: boolean;
  isParallel: boolean;
  isAlternateArt: boolean;
  isPromo: boolean;
  collectorNumber: string | null;
  imageSmallUrl: string | null;
  imageMediumUrl: string | null;
  imageLargeUrl: string | null;
  createdAt: string;
}

export type ProductType =
  | "booster"
  | "display"
  | "starter_deck"
  | "premium_collection"
  | "gift_collection"
  | "tournament_pack"
  | "promo"
  | "magazine"
  | "coffret";

/** A sellable product a printing can be pulled from ("Disponible dans :"). */
export interface Product {
  id: ID;
  gameId: ID;
  name: string;
  productType: ProductType;
  setId: ID | null;
  releaseDate: string | null;
  imageUrl: string | null;
}

export interface CardPrintingProductSource {
  id: ID;
  cardPrintingId: ID;
  productId: ID;
}

/** Denormalized shape returned by search/detail queries, safe to render directly. */
export interface CardWithPrimaryPrinting extends Card {
  primaryPrinting: CardPrinting | null;
  setCode: string | null;
  setName: string | null;
}
