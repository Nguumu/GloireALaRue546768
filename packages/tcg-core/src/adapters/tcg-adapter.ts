import type { Card, DeckOwnershipSummary, DeckValidationResult, ID } from "@tcg/types";

export interface DeckListEntry {
  card: Card;
  quantity: number;
}

/** A resolved decklist: real Card objects, not just ids — every TCGAdapter
 * method works on these directly so it never has to hit the database itself. */
export interface DeckList {
  leader: Card | null;
  entries: DeckListEntry[];
}

export interface DeckRules {
  requiresLeader: boolean;
  mainDeckSize: number | null; // null = no fixed size requirement
  maxCopiesPerCard: number;
  /** Non-leader cards must share at least one color with the leader, when true. */
  enforcesColorIdentity: boolean;
}

export type CardFilterFieldType = "select" | "multi-select" | "range" | "text" | "boolean";

export interface CardFilterDefinition {
  key: string;
  label: string;
  type: CardFilterFieldType;
  /** For select/multi-select filters with a known, small value set. */
  options?: string[];
}

export interface ParsedDeckList {
  deckList: DeckList;
  /** card numbers present in the input text that couldn't be resolved to a Card. */
  unresolvedCardNumbers: string[];
}

/**
 * Per-game rules and formatting logic. Only OnePieceAdapter is complete in
 * the MVP (section 29/49) — a future PokemonAdapter/MagicAdapter implements
 * the same shape without touching any caller.
 */
export interface TCGAdapter {
  readonly gameCode: string;

  getDeckRules(): DeckRules;

  getCardFilters(): CardFilterDefinition[];

  validateDeck(deck: DeckList): DeckValidationResult;

  /** Cross-references a decklist against a user's owned quantities (by card id). */
  calculateDeckCompatibility(
    deck: DeckList,
    ownedQuantityByCardId: Map<ID, number>,
  ): DeckOwnershipSummary;

  /** Parses a pasted decklist (one "qty cardNumber" per line, "1x LEADER ..." for the leader). */
  parseDeckList(text: string, resolveCard: (cardNumber: string) => Card | undefined): ParsedDeckList;

  /** Renders a decklist back to the same copy/paste text format `parseDeckList` accepts. */
  exportDeckList(deck: DeckList): string;
}
