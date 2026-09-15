import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

/**
 * Canonical client type for every query function. The plain `Schema`
 * (3rd) type parameter is pinned to `any` deliberately: `@supabase/ssr`'s
 * `createServerClient<Database>()` and `@supabase/supabase-js`'s own
 * `SupabaseClient<Database>` each recompute that parameter's default
 * independently, and `SupabaseClient`'s internal method overloads make it
 * invariant in `Schema` — so two structurally-identical-but-separately-
 * instantiated defaults aren't assignable to each other. Query functions
 * only ever call `.from(...)`, which doesn't need `Schema` precision.
 */
export type TypedSupabaseClient = SupabaseClient<Database, "public", any>;
