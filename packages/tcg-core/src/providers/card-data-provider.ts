import type { CardCategory, CardLanguage, ProductType, SetType } from "@tcg/types";

/**
 * Provider-shaped data, addressed by natural keys (codes) rather than DB
 * uuids — the sync script (packages/database/src/scripts/sync-cards.ts)
 * is responsible for upserting these into Postgres and resolving ids.
 *
 * Architecture (section 50): Provider -> normalization -> local Postgres ->
 * application. The app never calls a CardDataProvider directly; only sync
 * scripts do, on a schedule or manually. If a provider disappears, only its
 * implementation of this interface needs replacing.
 */
export interface NormalizedGame {
  code: string;
  name: string;
}

export interface NormalizedSet {
  gameCode: string;
  code: string;
  name: string;
  releaseDate: string | null;
  imageUrl: string | null;
  language: CardLanguage;
  setType: SetType;
}

export interface NormalizedCard {
  gameCode: string;
  cardNumber: string;
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
  primarySetCode: string | null;
  metadata: Record<string, unknown>;
}

export interface NormalizedCardPrinting {
  cardNumber: string; // resolves to NormalizedCard by (gameCode, cardNumber)
  setCode: string;
  language: CardLanguage;
  illustrationLabel: string | null;
  isFoil: boolean;
  isParallel: boolean;
  isAlternateArt: boolean;
  isPromo: boolean;
  collectorNumber: string | null;
  imageSmallUrl: string | null;
  imageMediumUrl: string | null;
  imageLargeUrl: string | null;
}

export interface NormalizedProduct {
  gameCode: string;
  name: string;
  productType: ProductType;
  setCode: string | null;
  releaseDate: string | null;
  imageUrl: string | null;
  /** Card numbers obtainable from this product ("Disponible dans :", section 7). */
  cardNumbers: string[];
}

export interface CardDataProvider {
  readonly sourceName: string;
  fetchGames(): Promise<NormalizedGame[]>;
  fetchSets(gameCode: string): Promise<NormalizedSet[]>;
  fetchCards(gameCode: string, setCode?: string): Promise<NormalizedCard[]>;
  fetchPrintings(gameCode: string, setCode?: string): Promise<NormalizedCardPrinting[]>;
  fetchProducts(gameCode: string): Promise<NormalizedProduct[]>;
}
