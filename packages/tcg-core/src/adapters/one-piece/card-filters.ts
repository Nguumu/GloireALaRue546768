import type { CardFilterDefinition } from "../tcg-adapter";

export const ONE_PIECE_CARD_FILTERS: CardFilterDefinition[] = [
  { key: "set", label: "Extension", type: "select" },
  {
    key: "colors",
    label: "Couleur",
    type: "multi-select",
    options: ["Red", "Green", "Blue", "Purple", "Black", "Yellow"],
  },
  {
    key: "rarity",
    label: "Rareté",
    type: "select",
    options: ["Common", "Uncommon", "Rare", "Super Rare", "Secret Rare", "Leader", "Special"],
  },
  {
    key: "category",
    label: "Type",
    type: "select",
    options: ["LEADER", "CHARACTER", "EVENT", "STAGE"],
  },
  { key: "character", label: "Personnage", type: "text" },
  { key: "cost", label: "Coût", type: "range" },
  { key: "power", label: "Puissance", type: "range" },
  { key: "counter", label: "Counter", type: "range" },
  { key: "attribute", label: "Attribut", type: "select" },
  { key: "trait", label: "Trait", type: "text" },
  { key: "owned", label: "Possédé", type: "boolean" },
];
