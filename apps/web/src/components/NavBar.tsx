import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/actions/auth";
import { Button } from "@tcg/ui";
import { ThemeToggle } from "./ThemeToggle";

// Bottom-nav items grow as phases ship (Scanner, Decks, Wishlist, Échanges,
// Actualités — section 44); only routes that exist are linked here.
const PUBLIC_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/one-piece/cards", label: "Recherche" },
];
const AUTHENTICATED_LINKS = [
  { href: "/collection", label: "Collection" },
  { href: "/dashboard", label: "Dashboard" },
];

export async function NavBar() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const links = user ? [...PUBLIC_LINKS, ...AUTHENTICATED_LINKS] : PUBLIC_LINKS;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-surface-200 bg-white/80 backdrop-blur dark:border-surface-800 dark:bg-surface-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-brand-600">
            TCG Collection
          </Link>

          <nav className="hidden items-center gap-6 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-surface-600 hover:text-brand-600 dark:text-surface-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <form action={signOutAction}>
                <Button variant="secondary" size="sm" type="submit">
                  Déconnexion
                </Button>
              </form>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-surface-200 bg-white/95 backdrop-blur sm:hidden dark:border-surface-800 dark:bg-surface-950/95"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {(user ? [...PUBLIC_LINKS, AUTHENTICATED_LINKS[0]!] : PUBLIC_LINKS).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium text-surface-600 dark:text-surface-300"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
