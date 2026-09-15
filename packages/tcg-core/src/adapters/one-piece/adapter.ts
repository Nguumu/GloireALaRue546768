import type { DeckOwnershipSummary, DeckValidationResult, ID } from "@tcg/types";
import { calculateDeckOwnership } from "../../shared/compatibility";
import type {
  CardFilterDefinition,
  DeckList,
  DeckRules,
  ParsedDeckList,
  TCGAdapter,
} from "../tcg-adapter";
import { ONE_PIECE_CARD_FILTERS } from "./card-filters";
import { exportOnePieceDeckList, parseOnePieceDeckList } from "./decklist-format";
import { ONE_PIECE_DECK_RULES, validateOnePieceDeck } from "./rules";

export class OnePieceAdapter implements TCGAdapter {
  readonly gameCode = "one-piece";

  getDeckRules(): DeckRules {
    return ONE_PIECE_DECK_RULES;
  }

  getCardFilters(): CardFilterDefinition[] {
    return ONE_PIECE_CARD_FILTERS;
  }

  validateDeck(deck: DeckList): DeckValidationResult {
    return validateOnePieceDeck(deck);
  }

  calculateDeckCompatibility(
    deck: DeckList,
    ownedQuantityByCardId: Map<ID, number>,
  ): DeckOwnershipSummary {
    return calculateDeckOwnership(deck, ownedQuantityByCardId);
  }

  parseDeckList(text: string, resolveCard: Parameters<TCGAdapter["parseDeckList"]>[1]): ParsedDeckList {
    return parseOnePieceDeckList(text, resolveCard);
  }

  exportDeckList(deck: DeckList): string {
    return exportOnePieceDeckList(deck);
  }
}

export const onePieceAdapter = new OnePieceAdapter();
