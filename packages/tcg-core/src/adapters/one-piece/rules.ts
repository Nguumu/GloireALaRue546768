import type { DeckValidationResult } from "@tcg/types";
import type { DeckList, DeckRules } from "../tcg-adapter";

/**
 * One Piece Card Game deck construction rules (section 29 — kept out of any
 * React component, per the brief's instruction to isolate game rules in
 * /tcg-rules/<game>).
 */
export const ONE_PIECE_DECK_RULES: DeckRules = {
  requiresLeader: true,
  mainDeckSize: 50,
  maxCopiesPerCard: 4,
  enforcesColorIdentity: true,
};

export function validateOnePieceDeck(deck: DeckList): DeckValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!deck.leader) {
    errors.push("A deck needs exactly one leader.");
  } else if (!deck.leader.isLeader) {
    errors.push(`"${deck.leader.name}" is not a leader card.`);
  }

  const mainDeckCount = deck.entries.reduce((sum, e) => sum + e.quantity, 0);
  if (mainDeckCount !== ONE_PIECE_DECK_RULES.mainDeckSize) {
    errors.push(
      `Main deck must contain exactly ${ONE_PIECE_DECK_RULES.mainDeckSize} cards (found ${mainDeckCount}).`,
    );
  }

  for (const entry of deck.entries) {
    if (entry.quantity > ONE_PIECE_DECK_RULES.maxCopiesPerCard) {
      errors.push(
        `"${entry.card.name}" (${entry.card.cardNumber}) has ${entry.quantity} copies, max is ${ONE_PIECE_DECK_RULES.maxCopiesPerCard}.`,
      );
    }
    if (entry.card.isLeader) {
      errors.push(`"${entry.card.name}" is a leader and cannot be in the main deck.`);
    }
  }

  if (deck.leader) {
    const leaderColors = new Set(deck.leader.colors);
    for (const entry of deck.entries) {
      const sharesColor = entry.card.colors.some((c) => leaderColors.has(c));
      if (!sharesColor && entry.card.colors.length > 0) {
        errors.push(
          `"${entry.card.name}" (${entry.card.colors.join("/")}) doesn't share a color with leader ${deck.leader.name} (${deck.leader.colors.join("/")}).`,
        );
      }
    }
  }

  const seen = new Map<string, number>();
  for (const entry of deck.entries) {
    seen.set(entry.card.cardNumber, (seen.get(entry.card.cardNumber) ?? 0) + entry.quantity);
  }
  for (const [cardNumber, total] of seen) {
    if (total > ONE_PIECE_DECK_RULES.maxCopiesPerCard) {
      warnings.push(`${cardNumber} appears ${total} times across entries — check for duplicate rows.`);
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}
