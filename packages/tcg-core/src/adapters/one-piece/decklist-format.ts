import type { Card } from "@tcg/types";
import type { DeckList, ParsedDeckList } from "../tcg-adapter";

const LEADER_LINE = /^leader:?\s*(\S+)/i;
const QUANTITY_LINE = /^(\d+)x?\s+(\S+)/i;

/**
 * Internal copy/paste decklist format (section 32/33):
 *   Leader: OP01-001
 *   4x OP01-016
 *   2 OP01-025
 * Blank lines and lines starting with "//" are ignored.
 */
export function parseOnePieceDeckList(
  text: string,
  resolveCard: (cardNumber: string) => Card | undefined,
): ParsedDeckList {
  let leader: Card | null = null;
  const entries: DeckList["entries"] = [];
  const unresolvedCardNumbers: string[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//")) continue;

    const leaderMatch = line.match(LEADER_LINE);
    if (leaderMatch) {
      const cardNumber = leaderMatch[1] as string;
      const card = resolveCard(cardNumber);
      if (card) leader = card;
      else unresolvedCardNumbers.push(cardNumber);
      continue;
    }

    const qtyMatch = line.match(QUANTITY_LINE);
    if (qtyMatch) {
      const quantity = Number(qtyMatch[1]);
      const cardNumber = qtyMatch[2] as string;
      const card = resolveCard(cardNumber);
      if (card) entries.push({ card, quantity });
      else unresolvedCardNumbers.push(cardNumber);
    }
  }

  return { deckList: { leader, entries }, unresolvedCardNumbers };
}

export function exportOnePieceDeckList(deck: DeckList): string {
  const lines: string[] = [];
  if (deck.leader) lines.push(`Leader: ${deck.leader.cardNumber}`);
  for (const entry of deck.entries) {
    lines.push(`${entry.quantity}x ${entry.card.cardNumber}`);
  }
  return lines.join("\n");
}
