import type { Metadata } from "next";
import { searchCards } from "@tcg/database";
import { getTCGAdapter } from "@tcg/tcg-core";
import { cardSearchQuerySchema } from "@tcg/utils";
import { CardGrid } from "@/components/CardGrid";
import { FiltersPanel } from "@/components/FiltersPanel";
import { PaginationControls } from "@/components/PaginationControls";
import { SearchBar } from "@/components/SearchBar";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Recherche de cartes" };

interface PageProps {
  params: { gameCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function CardSearchPage({ params, searchParams }: PageProps) {
  const adapter = getTCGAdapter(params.gameCode);
  const query = cardSearchQuerySchema.parse({
    q: searchParams.q,
    gameCode: params.gameCode,
    rarity: searchParams.rarity,
    category: searchParams.category,
    colors: searchParams.colors ? [searchParams.colors].flat() : undefined,
    page: searchParams.page ? Number(searchParams.page) : undefined,
    pageSize: searchParams.pageSize ? Number(searchParams.pageSize) : undefined,
  });

  const supabase = getSupabaseServerClient();
  const result = await searchCards(supabase, query);
  const basePath = `/${params.gameCode}/cards`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SearchBar basePath={basePath} />
        <FiltersPanel basePath={basePath} filters={adapter.getCardFilters()} />
      </div>

      <p className="text-sm text-surface-500">{result.total} carte(s) trouvée(s)</p>

      <CardGrid gameCode={params.gameCode} cards={result.items} />

      <PaginationControls
        basePath={basePath}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
      />
    </div>
  );
}
