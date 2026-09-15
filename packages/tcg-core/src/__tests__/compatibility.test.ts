import { describe, expect, it } from "vitest";
import { calculateDeckOwnership } from "../shared/compatibility";
import { makeCard, makeLeader } from "./fixtures";

describe("calculateDeckOwnership", () => {
  it("counts owned vs missing cards, including the leader", () => {
    const leader = makeLeader({ id: "leader-1" });
    const cardA = makeCard({ id: "card-a" });
    const cardB = makeCard({ id: "card-b" });
    const deck = { leader, entries: [{ card: cardA, quantity: 4 }, { card: cardB, quantity: 2 }] };

    const owned = new Map([
      ["leader-1", 1],
      ["card-a", 2], // only 2 of 4 owned
      // card-b: 0 owned
    ]);

    const summary = calculateDeckOwnership(deck, owned);
    expect(summary.totalCards).toBe(1 + 4 + 2);
    expect(summary.ownedCards).toBe(1 + 2 + 0);
    expect(summary.missing).toEqual([
      { cardId: "card-a", quantityMissing: 2 },
      { cardId: "card-b", quantityMissing: 2 },
    ]);
  });

  it("never counts more owned copies than the deck actually needs", () => {
    const cardA = makeCard({ id: "card-a" });
    const deck = { leader: null, entries: [{ card: cardA, quantity: 2 }] };
    const owned = new Map([["card-a", 10]]); // surplus/doubles shouldn't inflate ownedCards

    const summary = calculateDeckOwnership(deck, owned);
    expect(summary.ownedCards).toBe(2);
    expect(summary.missing).toEqual([]);
  });
});
