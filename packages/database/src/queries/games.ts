import type { TypedSupabaseClient } from "../client/types";
import { mapGameRow } from "../mappers";

export async function listGames(supabase: TypedSupabaseClient) {
  const { data, error } = await supabase.from("games").select("*").eq("is_active", true).order("name");
  if (error) throw error;
  return (data ?? []).map(mapGameRow);
}
