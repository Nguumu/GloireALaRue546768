import type { Metadata } from "next";
import Link from "next/link";
import { getCollectionStats } from "@tcg/database";
import { formatMoney } from "@tcg/utils";
import { CardThumbnail } from "@tcg/ui";
import { StatCard } from "@/components/StatCard";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase } = await requireUser("/dashboard");
  const stats = await getCollectionStats(supabase);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Cartes possédées" value={String(stats.totalCards)} />
        <StatCard label="Cartes uniques" value={String(stats.uniquePrintings)} />
        <StatCard
          label="Prix d'achat total"
          value={
            stats.totalPurchasePriceMinor !== null
              ? formatMoney({ amountMinor: stats.totalPurchasePriceMinor, currency: "EUR" })
              : "—"
          }
        />
        <StatCard
          label="Valeur estimée"
          value="—"
          hint="Nécessite une source de prix (Phase 5, pas encore branchée)"
        />
        <StatCard label="Doubles" value={String(stats.doublesCount)} hint="Cartes en surplus" />
        <StatCard label="Cartes gradées" value={String(stats.gradedCardsCount)} />
        <StatCard label="Produits scellés" value={String(stats.sealedProductsCount)} />
        <StatCard
          label="Progression Master Set"
          value="—"
          hint="Pas encore disponible (voir roadmap)"
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Récemment ajoutées</h2>
          <Link href="/collection" className="text-sm text-brand-600 hover:underline">
            Voir toute la collection →
          </Link>
        </div>
        {stats.recentlyAdded.length === 0 ? (
          <p className="text-sm text-surface-500">
            Aucune carte ajoutée pour le moment.{" "}
            <Link href="/one-piece/cards" className="text-brand-600 hover:underline">
              Rechercher des cartes →
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {stats.recentlyAdded.map((entry) => (
              <Link
                key={entry.id}
                href={`/one-piece/cards/${entry.card.cardNumber.toLowerCase()}`}
                className="flex flex-col gap-1"
              >
                <CardThumbnail
                  name={entry.card.name}
                  cardNumber={entry.card.cardNumber}
                  imageUrl={entry.printing.imageSmallUrl}
                />
                <span className="truncate text-xs font-medium">{entry.card.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
