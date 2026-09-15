import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { TypedSupabaseClient } from "./types";
import type { Database } from "../types/database.types";

/**
 * Framework-agnostic cookie adapter — callers (e.g. apps/web) pass Next.js's
 * `cookies()` store here so this package stays decoupled from Next.js itself.
 */
export interface CookieAdapter {
  get(name: string): string | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  remove(name: string, options: CookieOptions): void;
}

export function createSupabaseServerClient(cookies: CookieAdapter): TypedSupabaseClient {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookies.get(name),
        set: (name: string, value: string, options: CookieOptions) => cookies.set(name, value, options),
        remove: (name: string, options: CookieOptions) => cookies.remove(name, options),
      },
    },
  );
}
