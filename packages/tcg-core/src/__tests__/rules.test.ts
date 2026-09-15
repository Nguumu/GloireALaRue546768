import { describe, expect, it } from "vitest";
import { validateOnePieceDeck, ONE_PIECE_DECK_RULES } from "../adapters/one-piece/rules";
import type { DeckList } from "../adapters/tcg-adapter";
import { makeCard, makeLeader } from "./fixtures";

function fullValidDeck(): DeckList {
  const leader = makeLeader({ colors: ["Red"] });
  const entries = Array.from({ length: 13 }, (_, i) =>
    ({ card: makeCard({ cardNumber: `OP01-${i + 10}`, colors: ["Red"] }), quantity: 4 }),
  );
  // 13 * 4 = 52, trim last entry to hit exactly 50
  entries[entries.length - 1]!.quantity = 2;
  return { leader, entries };
}

describe("validateOnePieceDeck", () => {
  it("accepts a deck with exactly 50 main-deck cards, one leader, matching colors", () => {
    const result = validateOnePieceDeck(fullValidDeck());
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects a deck missing a leader", () => {
    const deck = fullValidDeck();
    deck.leader = null;
    const result = validateOnePieceDeck(deck);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("leader"))).toBe(true);
  });

  it("rejects a deck that isn't exactly 50 cards", () => {
    const deck = fullValidDeck();
    deck.entries = deck.entries.slice(0, 1);
    const result = validateOnePieceDeck(deck);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes(String(ONE_PIECE_DECK_RULES.mainDeckSize)))).toBe(true);
  });

  it("rejects more than 4 copies of a card", () => {
    const deck = fullValidDeck();
    deck.entries[0]!.quantity = 5;
    const result = validateOnePieceDeck(deck);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("copies"))).toBe(true);
  });

  it("rejects cards that don't share a color with the leader", () => {
    const deck = fullValidDeck();
    deck.entries[0]!.card = makeCard({ colors: ["Blue"] });
    const result = validateOnePieceDeck(deck);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("color"))).toBe(true);
  });

  it("rejects a leader card placed in the main deck", () => {
    const deck = fullValidDeck();
    deck.entries[0]!.card = makeLeader({ colors: ["Red"] });
    const result = validateOnePieceDeck(deck);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("leader and cannot"))).toBe(true);
  });
});
