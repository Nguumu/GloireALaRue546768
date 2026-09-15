import { Badge, type BadgeTone } from "./Badge";

const TONE_BY_RARITY: Record<string, BadgeTone> = {
  Common: "neutral",
  Uncommon: "brand",
  Rare: "success",
  "Super Rare": "warning",
  "Secret Rare": "danger",
  Leader: "danger",
  Special: "warning",
};

export function RarityBadge({ rarity }: { rarity: string }) {
  return <Badge tone={TONE_BY_RARITY[rarity] ?? "neutral"}>{rarity}</Badge>;
}
