import type { CardWithPrimaryPrinting, PaginatedResult } from "@tcg/types";
import { buildPaginatedResult, normalizePagination, toRange, type CardSearchQuery } from "@tcg/utils";
import type { TypedSupabaseClient } from "../client/types";
import { mapCardPrintingRow, mapCardRow } from "../mappers";

type Client = TypedSupabaseClient;

/**
 * Server-side search: filters, full-text query and pagination all happen in
 * Postgres — the client never receives more than one page of cards
 * (section 2/10/11). Thumbnails only; the detail page loads larger images.
 */
export async function searchCards(
  supabase: Client,
  query: CardSearchQuery,
): Promise<PaginatedResult<CardWithPrimaryPrinting>> {
  const { page, pageSize } = normalizePagination(query);
  const { from, to } = toRange(page, pageSize);

  let builder = supabase
    .from("cards")
    .select("*, sets!cards_primary_set_id_fkey(code, name)", { count: "exact" });

  if (query.gameCode) {
    const { data: game } = await supabase.from("games").select("id").eq("code", query.gameCode).single();
    if (game) builder = builder.eq("game_id", game.id);
  }
  if (query.q) {
    builder = builder.textSearch("search_vector", query.q, { type: "websearch", config: "simple" });
  }
  if (query.rarity) builder = builder.eq("rarity", query.rarity);
  if (query.category) builder = builder.eq("category", query.category);
  if (query.colors?.length) builder = builder.overlaps("colors", query.colors);

  const { data, count, error } = await builder.order("card_number").range(from, to);
  if (error) throw error;

  const cardIds = (data ?? []).map((row) => row.id);
  const { data: printingRows } = cardIds.length
    ? await supabase.from("card_printings").select("*").in("card_id", cardIds)
    : { data: [] };

  const firstPrintingByCardId = new Map<string, ReturnType<typeof mapCardPrintingRow>>();
  for (const row of printingRows ?? []) {
    if (!firstPrintingByCardId.has(row.card_id)) {
      firstPrintingByCardId.set(row.card_id, mapCardPrintingRow(row));
    }
  }

  const items: CardWithPrimaryPrinting[] = (data ?? []).map((row) => {
    // `Database` doesn't model FK relationships (see database.types.ts header) so
    // the embed's type resolves to a SelectQueryError placeholder — the runtime
    // shape is correct (verified against a live schema), hence the double cast.
    const setInfo = row.sets as unknown as { code: string; name: string } | null;
    return {
      ...mapCardRow(row),
      primaryPrinting: firstPrintingByCardId.get(row.id) ?? null,
      setCode: setInfo?.code ?? null,
      setName: setInfo?.name ?? null,
    };
  });

  return buildPaginatedResult(items, count ?? 0, page, pageSize);
}

export interface CardDetail {
  card: ReturnType<typeof mapCardRow>;
  printings: ReturnType<typeof mapCardPrintingRow>[];
}

/** SEO-friendly lookup by (gameCode, cardNumber) — see /one-piece/cards/op01-001 routes. */
export async function getCardDetail(
  supabase: Client,
  gameCode: string,
  cardNumber: string,
): Promise<CardDetail | null> {
  const { data: game } = await supabase.from("games").select("id").eq("code", gameCode).single();
  if (!game) return null;

  const { data: cardRow } = await supabase
    .from("cards")
    .select("*")
    .eq("game_id", game.id)
    .ilike("card_number", cardNumber)
    .maybeSingle();
  if (!cardRow) return null;

  const { data: printingRows } = await supabase
    .from("card_printings")
    .select("*")
    .eq("card_id", cardRow.id)
    .order("created_at");

  return {
    card: mapCardRow(cardRow),
    printings: (printingRows ?? []).map(mapCardPrintingRow),
  };
}
