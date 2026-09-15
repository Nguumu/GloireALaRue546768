import type { ID } from "@tcg/types";

export interface StapleThresholds {
  /** presence_rate >= major -> "Staple majeur" */
  major: number;
  /** presence_rate >= frequent -> "Très fréquente" */
  frequent: number;
  /** presence_rate >= situational -> "Situationnelle fréquente" */
  situational: number;
}

export const DEFAULT_STAPLE_THRESHOLDS: StapleThresholds = {
  major: 0.8,
  frequent: 0.5,
  situational: 0.25,
};

/** Below this many analyzed decks, the rate is too noisy to publish without a caveat (section 36). */
export const MIN_SAMPLE_SIZE = 20;

export type StapleTier = "MAJOR" | "FREQUENT" | "SITUATIONAL" | "NONE";

export function classifyStapleTier(
  presenceRate: number,
  thresholds: StapleThresholds = DEFAULT_STAPLE_THRESHOLDS,
): StapleTier {
  if (presenceRate >= thresholds.major) return "MAJOR";
  if (presenceRate >= thresholds.frequent) return "FREQUENT";
  if (presenceRate >= thresholds.situational) return "SITUATIONAL";
  return "NONE";
}

export interface AnalyzedDeck {
  leaderCardId: ID | null;
  cardIds: Set<ID>;
}

export interface StapleStats {
  cardId: ID;
  decksAnalyzed: number;
  decksContainingCard: number;
  presenceRate: number;
  tier: StapleTier;
  /** true when decksAnalyzed < MIN_SAMPLE_SIZE — UI must show this caveat, never hide it. */
  lowSampleSize: boolean;
  topLeaderIds: ID[];
}

/**
 * presence_rate = decks containing the card / compatible decks analyzed
 * (section 36). `isCompatibleDeck` narrows the denominator — e.g. "decks
 * using this leader" or "decks in this color" — callers decide the scope.
 */
export function computeStapleStats(
  cardId: ID,
  decks: AnalyzedDeck[],
  options: {
    isCompatibleDeck?: (deck: AnalyzedDeck) => boolean;
    thresholds?: StapleThresholds;
    minSampleSize?: number;
  } = {},
): StapleStats {
  const isCompatibleDeck = options.isCompatibleDeck ?? (() => true);
  const compatibleDecks = decks.filter(isCompatibleDeck);
  const decksAnalyzed = compatibleDecks.length;

  const leaderCounts = new Map<ID, number>();
  let decksContainingCard = 0;
  for (const deck of compatibleDecks) {
    if (deck.cardIds.has(cardId)) {
      decksContainingCard += 1;
      if (deck.leaderCardId) {
        leaderCounts.set(deck.leaderCardId, (leaderCounts.get(deck.leaderCardId) ?? 0) + 1);
      }
    }
  }

  const presenceRate = decksAnalyzed === 0 ? 0 : decksContainingCard / decksAnalyzed;
  const topLeaderIds = [...leaderCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([leaderId]) => leaderId);

  return {
    cardId,
    decksAnalyzed,
    decksContainingCard,
    presenceRate,
    tier: classifyStapleTier(presenceRate, options.thresholds),
    lowSampleSize: decksAnalyzed < (options.minSampleSize ?? MIN_SAMPLE_SIZE),
    topLeaderIds,
  };
}
