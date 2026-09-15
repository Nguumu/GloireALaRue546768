import type { ID } from "@tcg/types";
import type { TypedSupabaseClient } from "../client/types";
import { mapStorageLocationRow } from "../mappers";

export async function listStorageLocations(supabase: TypedSupabaseClient, userId: ID) {
  const { data, error } = await supabase
    .from("storage_locations")
    .select("*")
    .eq("user_id", userId)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(mapStorageLocationRow);
}

/** Create-or-reuse by name (section 9 — a flat location field must stay valid; hierarchy is optional). */
export async function findOrCreateStorageLocation(
  supabase: TypedSupabaseClient,
  userId: ID,
  name: string,
): Promise<ID> {
  const trimmed = name.trim();
  const { data: existing, error: findError } = await supabase
    .from("storage_locations")
    .select("id")
    .eq("user_id", userId)
    .eq("name", trimmed)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id;

  const { data: created, error: createError } = await supabase
    .from("storage_locations")
    .insert({ user_id: userId, name: trimmed })
    .select("id")
    .single();
  if (createError) throw createError;
  return created.id;
}
