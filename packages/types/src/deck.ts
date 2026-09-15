import type { ID } from "./common";

export interface Deck {
  id: ID;
  userId: ID;
  gameId: ID;
  leaderCardId: ID | null; // null for games without a leader mechanic
  name: string;
  description: string | null;
  format: string | null;
  isPublic: boolean;
  tags: string[];
  likeCount: number;
  viewCount: number;
  tournamentResult: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeckCard {
  id: ID;
  deckId: ID;
  cardId: ID;
  quantity: number;
}

export interface DeckGuide {
  id: ID;
  deckId: ID;
  /** Free-form markdown; sections below are conventions, not enforced structure. */
  contentMarkdown: string;
  updatedAt: string;
}

/** Result of comparing a deck's card list against a user's collection. */
export interface DeckOwnershipSummary {
  totalCards: number;
  ownedCards: number;
  missing: Array<{ cardId: ID; quantityMissing: number }>;
}

/** Validation result from a TCGAdapter.validateDeck() call. */
export interface DeckValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
