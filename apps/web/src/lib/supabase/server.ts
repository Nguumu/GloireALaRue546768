import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@tcg/database";

/**
 * Server Components can't write cookies (Next.js throws) — the `set`/`remove`
 * calls there are no-ops in practice because `middleware.ts` refreshes the
 * session on every request. Server Actions and Route Handlers *can* write,
 * and that's where sign-in/sign-out actually persist the session.
 */
export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createSupabaseServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: (name, value, options) => {
      try {
        cookieStore.set({ name, value, ...options });
      } catch {
        // Called from a Server Component render — safe to ignore.
      }
    },
    remove: (name, options) => {
      try {
        cookieStore.set({ name, value: "", ...options });
      } catch {
        // Called from a Server Component render — safe to ignore.
      }
    },
  });
}
