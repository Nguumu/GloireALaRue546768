import Link from "next/link";
import { listGames } from "@tcg/database";
import { Button } from "@tcg/ui";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = getSupabaseServerClient();
  const games = await listGames(supabase).catch(() => []);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-start gap-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Votre collection TCG, enfin organisée.
        </h1>
        <p className="max-w-xl text-surface-600 dark:text-surface-300">
          Recherchez des cartes, suivez votre collection, vos doubles et la valeur de vos cartes. One Piece
          Card Game aujourd&apos;hui — d&apos;autres jeux bientôt.
        </p>
        <Link href="/one-piece/cards">
          <Button size="lg">Rechercher une carte</Button>
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Jeux disponibles</h2>
        {games.length === 0 ? (
          <p className="text-sm text-surface-500">
            Aucun jeu synchronisé pour le moment — lancez <code>pnpm db:seed</code>.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {games.map((game) => (
              <li key={game.id}>
                <Link
                  href={`/${game.code}/cards`}
                  className="block rounded-xl border border-surface-200 p-4 transition-colors hover:border-brand-400 dark:border-surface-800"
                >
                  <span className="font-medium">{game.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
