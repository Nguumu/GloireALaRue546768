import type { Metadata } from "next";
import Link from "next/link";
import { getDoubles } from "@tcg/database";
import { CollectionEntryCard } from "@/components/CollectionEntryCard";
import { PaginationControls } from "@/components/PaginationControls";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Mes doubles" };

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function DoublesPage({ searchParams }: PageProps) {
  const { supabase, user } = await requireUser("/collection/doubles");
  const result = await getDoubles(supabase, user.id, {
    page: searchParams.page ? Number(searchParams.page) : undefined,
  });

  const totalSurplus = result.items.reduce((sum, e) => sum + (e.quantity - e.keepQuantity), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes doubles</h1>
        <Link href="/collection" className="text-sm text-brand-600 hover:underline">
          ← Retour à la collection
        </Link>
      </div>

      <p className="text-sm text-surface-500">
        {result.total} carte(s) en double — {totalSurplus} exemplaire(s) en surplus sur cette page. Cochez
        « Disponible à l&apos;échange » pour la proposer dans les échanges (section 18/38).
      </p>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-300 p-8 text-center text-surface-500 dark:border-surface-700">
          Aucun double pour le moment. Une carte apparaît ici dès que sa quantité possédée dépasse la
          quantité que vous voulez conserver.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {result.items.map((entry) => (
            <CollectionEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      <PaginationControls
        basePath="/collection/doubles"
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
      />
    </div>
  );
}
