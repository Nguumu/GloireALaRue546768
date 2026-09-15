import { describe, expect, it } from "vitest";
import { exportOnePieceDeckList, parseOnePieceDeckList } from "../adapters/one-piece/decklist-format";
import { makeCard, makeLeader } from "./fixtures";

describe("one piece decklist text format", () => {
  it("round-trips a decklist through export then parse", () => {
    const leader = makeLeader({ cardNumber: "OP01-001" });
    const cardA = makeCard({ cardNumber: "OP01-016" });
    const cardB = makeCard({ cardNumber: "OP01-025" });
    const deck = { leader, entries: [{ card: cardA, quantity: 4 }, { card: cardB, quantity: 2 }] };

    const text = exportOnePieceDeckList(deck);
    const byNumber = new Map([leader, cardA, cardB].map((c) => [c.cardNumber, c]));
    const { deckList, unresolvedCardNumbers } = parseOnePieceDeckList(text, (n) => byNumber.get(n));

    expect(unresolvedCardNumbers).toEqual([]);
    expect(deckList.leader?.cardNumber).toBe("OP01-001");
    expect(deckList.entries).toEqual([
      { card: cardA, quantity: 4 },
      { card: cardB, quantity: 2 },
    ]);
  });

  it("ignores blank lines and comments, and reports unresolved card numbers", () => {
    const { deckList, unresolvedCardNumbers } = parseOnePieceDeckList(
      "// my deck\n\nLeader: OP01-999\n4x OP01-998\n",
      () => undefined,
    );
    expect(deckList.leader).toBeNull();
    expect(deckList.entries).toEqual([]);
    expect(unresolvedCardNumbers).toEqual(["OP01-999", "OP01-998"]);
  });
});
