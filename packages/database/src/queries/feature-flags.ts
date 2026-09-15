import type { TypedSupabaseClient } from "../client/types";

/** Simple server-config feature flags (section 53) — one row per flag, no SaaS needed. */
export async function getFeatureFlags(supabase: TypedSupabaseClient): Promise<Record<string, boolean>> {
  const { data, error } = await supabase.from("feature_flags").select("key, enabled");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.enabled]));
}
