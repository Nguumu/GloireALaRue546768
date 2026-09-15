import type { Metadata } from "next";
import Link from "next/link";
import { getUserCollection, listSetsForGame, type CollectionSortKey } from "@tcg/database";
import { CollectionControls } from "@/components/CollectionControls";
import { CollectionEntryCard } from "@/components/CollectionEntryCard";
import { PaginationControls } from "@/components/PaginationControls";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Ma collection" };

const GAME_CODE = "one-piece"; // only game wired for the MVP (section 1)
const SORT_KEYS: CollectionSortKey[] = ["recent", "quantity", "name", "set_code", "rarity", "character"];

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function CollectionPage({ searchParams }: PageProps) {
  const { supabase, user } = await requireUser("/collection");

  const sort = (SORT_KEYS as string[]).includes(searchParams.sort ?? "")
    ? (searchParams.sort as CollectionSortKey)
    : "recent";

  const [sets, result] = await Promise.all([
    listSetsForGame(supabase, GAME_CODE),
    getUserCollection(
      supabase,
      user.id,
      { setCode: searchParams.set, rarity: searchParams.rarity, color: searchParams.color },
      sort,
      { page: searchParams.page ? Number(searchParams.page) : undefined },
    ),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ma collection</h1>
        <Link href="/collection/doubles" className="text-sm text-brand-600 hover:underline">
          Voir mes doubles →
        </Link>
      </div>

      <CollectionControls basePath="/collection" sets={sets} />

      <p className="text-sm text-surface-500">{result.total} entrée(s)</p>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-300 p-8 text-center text-surface-500 dark:border-surface-700">
          <p>Votre collection est vide.</p>
          <Link href={`/${GAME_CODE}/cards`} className="mt-2 inline-block text-brand-600 hover:underline">
            Rechercher des cartes à ajouter →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {result.items.map((entry) => (
            <CollectionEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      <PaginationControls basePath="/collection" page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}
