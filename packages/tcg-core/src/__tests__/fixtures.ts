import type { Card } from "@tcg/types";

let counter = 0;

export function makeCard(overrides: Partial<Card> = {}): Card {
  counter += 1;
  return {
    id: overrides.id ?? `card-${counter}`,
    gameId: "game-one-piece",
    cardNumber: overrides.cardNumber ?? `OP01-${String(counter).padStart(3, "0")}`,
    name: overrides.name ?? `Test Card ${counter}`,
    character: null,
    colors: ["Red"],
    category: "CHARACTER",
    rarity: "Common",
    cost: 1,
    power: 1000,
    counter: 1000,
    attribute: null,
    traits: [],
    text: null,
    isLeader: false,
    primarySetId: null,
    metadata: { game: "one-piece" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function makeLeader(overrides: Partial<Card> = {}): Card {
  return makeCard({ isLeader: true, category: "LEADER", rarity: "Leader", cost: null, ...overrides });
}
