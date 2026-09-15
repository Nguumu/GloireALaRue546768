import { describe, expect, it } from "vitest";
import { classifyStapleTier, computeStapleStats, MIN_SAMPLE_SIZE } from "../staples/staple-engine";
import type { AnalyzedDeck } from "../staples/staple-engine";

describe("classifyStapleTier", () => {
  it("classifies presence rates against the default thresholds", () => {
    expect(classifyStapleTier(0.9)).toBe("MAJOR");
    expect(classifyStapleTier(0.8)).toBe("MAJOR");
    expect(classifyStapleTier(0.6)).toBe("FREQUENT");
    expect(classifyStapleTier(0.3)).toBe("SITUATIONAL");
    expect(classifyStapleTier(0.1)).toBe("NONE");
  });

  it("honors custom thresholds", () => {
    expect(classifyStapleTier(0.5, { major: 0.4, frequent: 0.2, situational: 0.1 })).toBe("MAJOR");
  });
});

describe("computeStapleStats", () => {
  function deck(cardIds: string[], leaderCardId: string | null = null): AnalyzedDeck {
    return { leaderCardId, cardIds: new Set(cardIds) };
  }

  it("computes presence_rate as decks containing the card / decks analyzed", () => {
    const decks: AnalyzedDeck[] = [
      deck(["nami", "zoro"], "luffy"),
      deck(["nami"], "luffy"),
      deck(["zoro"], "luffy"),
      deck(["nami", "zoro"], "shanks"),
    ];
    const stats = computeStapleStats("nami", decks);
    expect(stats.decksAnalyzed).toBe(4);
    expect(stats.decksContainingCard).toBe(3);
    expect(stats.presenceRate).toBeCloseTo(0.75);
    expect(stats.topLeaderIds[0]).toBe("luffy"); // appears in 2 of the 3 containing decks
  });

  it("flags a low sample size instead of hiding it", () => {
    const decks: AnalyzedDeck[] = [deck(["nami"]), deck(["nami"])];
    const stats = computeStapleStats("nami", decks);
    expect(stats.decksAnalyzed).toBeLessThan(MIN_SAMPLE_SIZE);
    expect(stats.lowSampleSize).toBe(true);
  });

  it("scopes the denominator via isCompatibleDeck", () => {
    const decks: AnalyzedDeck[] = [
      deck(["nami"], "luffy"),
      deck(["nami"], "shanks"),
      deck([], "shanks"),
    ];
    const stats = computeStapleStats("nami", decks, {
      isCompatibleDeck: (d) => d.leaderCardId === "shanks",
    });
    expect(stats.decksAnalyzed).toBe(2);
    expect(stats.decksContainingCard).toBe(1);
    expect(stats.presenceRate).toBeCloseTo(0.5);
  });

  it("returns a 0 rate (not NaN) when there are no analyzed decks", () => {
    const stats = computeStapleStats("nami", []);
    expect(stats.presenceRate).toBe(0);
    expect(stats.tier).toBe("NONE");
  });
});
