import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCardDetail, getProductsForPrintings } from "@tcg/database";
import { Badge, CardThumbnail, ColorPip, RarityBadge } from "@tcg/ui";
import { AddToCollectionForm } from "@/components/AddToCollectionForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface PageProps {
  params: { gameCode: string; cardNumber: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = getSupabaseServerClient();
  const detail = await getCardDetail(supabase, params.gameCode, params.cardNumber);
  if (!detail) return {};
  return {
    title: `${detail.card.name} (${detail.card.cardNumber})`,
    description: detail.card.text ?? undefined,
  };
}

export default async function CardDetailPage({ params }: PageProps) {
  const supabase = getSupabaseServerClient();
  const detail = await getCardDetail(supabase, params.gameCode, params.cardNumber);
  if (!detail) notFound();

  const { card, printings } = detail;
  const productsByPrinting = await getProductsForPrintings(
    supabase,
    printings.map((p) => p.id),
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[280px_1fr]">
        <CardThumbnail
          name={card.name}
          cardNumber={card.cardNumber}
          imageUrl={printings[0]?.imageMediumUrl ?? printings[0]?.imageSmallUrl}
          className="mx-auto w-full max-w-xs sm:mx-0"
        />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-surface-500">{card.cardNumber}</p>
            <h1 className="text-2xl font-bold">{card.name}</h1>
            {card.character && card.character !== card.name && (
              <p className="text-surface-500">{card.character}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <RarityBadge rarity={card.rarity} />
            <Badge>{card.category}</Badge>
            {card.colors.map((color) => (
              <ColorPip key={color} color={color} />
            ))}
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            {card.cost !== null && (
              <Stat label="Coût" value={card.cost} />
            )}
            {card.power !== null && <Stat label="Puissance" value={card.power} />}
            {card.counter !== null && <Stat label="Counter" value={card.counter} />}
            {card.attribute && <Stat label="Attribut" value={card.attribute} />}
          </dl>

          {card.traits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.traits.map((trait) => (
                <Badge key={trait} tone="brand">
                  {trait}
                </Badge>
              ))}
            </div>
          )}

          {card.text && <p className="whitespace-pre-line text-sm text-surface-700 dark:text-surface-300">{card.text}</p>}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Toutes les versions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {printings.map((printing) => {
            const products = productsByPrinting.get(printing.id) ?? [];
            return (
              <div key={printing.id} className="flex flex-col gap-2">
                <CardThumbnail
                  name={card.name}
                  cardNumber={printing.collectorNumber ?? card.cardNumber}
                  imageUrl={printing.imageSmallUrl}
                />
                <div className="flex flex-wrap gap-1 text-xs text-surface-500">
                  <span>{printing.language}</span>
                  {printing.isFoil && <Badge tone="warning">Foil</Badge>}
                  {printing.isAlternateArt && <Badge tone="brand">Alt Art</Badge>}
                  {printing.isPromo && <Badge>Promo</Badge>}
                  {printing.illustrationLabel && <Badge tone="neutral">{printing.illustrationLabel}</Badge>}
                </div>
                {products.length > 0 && (
                  <p className="text-xs text-surface-400">
                    Disponible dans : {products.map((p) => p.name).join(", ")}
                  </p>
                )}
                {user ? (
                  <AddToCollectionForm cardPrintingId={printing.id} />
                ) : (
                  <Link href="/login" className="text-xs text-brand-600 hover:underline">
                    Se connecter pour l&apos;ajouter
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Link href={`/${params.gameCode}/cards`} className="text-sm text-brand-600 hover:underline">
        ← Retour à la recherche
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-surface-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
