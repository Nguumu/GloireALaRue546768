import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../types/database.types";

/** Client-component Supabase client — safe to call from anywhere in the browser bundle. */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
