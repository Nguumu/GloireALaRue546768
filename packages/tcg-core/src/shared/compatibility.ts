import type { DeckOwnershipSummary, ID } from "@tcg/types";
import type { DeckList } from "../adapters/tcg-adapter";

/** Game-agnostic: compares a decklist's card quantities against owned quantities. */
export function calculateDeckOwnership(
  deck: DeckList,
  ownedQuantityByCardId: Map<ID, number>,
): DeckOwnershipSummary {
  const allEntries = deck.leader
    ? [{ card: deck.leader, quantity: 1 }, ...deck.entries]
    : deck.entries;

  let totalCards = 0;
  let ownedCards = 0;
  const missing: DeckOwnershipSummary["missing"] = [];

  for (const entry of allEntries) {
    totalCards += entry.quantity;
    const owned = ownedQuantityByCardId.get(entry.card.id) ?? 0;
    const ownedForThisEntry = Math.min(owned, entry.quantity);
    ownedCards += ownedForThisEntry;
    const quantityMissing = entry.quantity - ownedForThisEntry;
    if (quantityMissing > 0) {
      missing.push({ cardId: entry.card.id, quantityMissing });
    }
  }

  return { totalCards, ownedCards, missing };
}
