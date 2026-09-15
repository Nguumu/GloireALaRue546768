import type { TypedSupabaseClient } from "../client/types";
import { mapSetRow } from "../mappers";

export async function listSetsForGame(supabase: TypedSupabaseClient, gameCode: string) {
  const { data: game } = await supabase.from("games").select("id").eq("code", gameCode).single();
  if (!game) return [];

  const { data, error } = await supabase
    .from("sets")
    .select("*")
    .eq("game_id", game.id)
    .order("release_date");
  if (error) throw error;
  return (data ?? []).map(mapSetRow);
}
