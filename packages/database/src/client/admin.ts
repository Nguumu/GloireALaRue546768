import { createClient } from "@supabase/supabase-js";
import type { TypedSupabaseClient } from "./types";
import type { Database } from "../types/database.types";

/**
 * Service-role client: bypasses RLS entirely. Server-only — for sync/seed
 * scripts and admin server actions. Never import this from client code or
 * ship SUPABASE_SERVICE_ROLE_KEY to the browser (section 46).
 */
export function createSupabaseAdminClient(): TypedSupabaseClient {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
