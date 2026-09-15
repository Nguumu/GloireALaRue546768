import Link from "next/link";
import type { CardWithPrimaryPrinting } from "@tcg/types";
import { CardThumbnail, RarityBadge } from "@tcg/ui";

export function CardGrid({ gameCode, cards }: { gameCode: string; cards: CardWithPrimaryPrinting[] }) {
  if (cards.length === 0) {
    return <p className="py-12 text-center text-surface-500">Aucune carte ne correspond à cette recherche.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/${gameCode}/cards/${card.cardNumber.toLowerCase()}`}
          className="group flex flex-col gap-2"
        >
          <CardThumbnail
            name={card.name}
            cardNumber={card.cardNumber}
            imageUrl={card.primaryPrinting?.imageSmallUrl}
            className="transition-shadow group-hover:shadow-lg"
          />
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-medium">{card.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-surface-500">
            <span>{card.cardNumber}</span>
            <RarityBadge rarity={card.rarity} />
          </div>
        </Link>
      ))}
    </div>
  );
}
