import type { CardCondition, CollectionEntryWithCard, CollectionStats, ID, PaginatedResult } from "@tcg/types";
import { buildPaginatedResult, normalizePagination, toRange } from "@tcg/utils";
import type { TypedSupabaseClient } from "../client/types";
import type { Database } from "../types/database.types";

type DetailedRow = Database["public"]["Views"]["collection_entries_detailed"]["Row"];

function mapDetailedRow(row: DetailedRow): CollectionEntryWithCard {
  return {
    id: row.id,
    userId: row.user_id,
    cardPrintingId: row.card_printing_id,
    quantity: row.quantity,
    keepQuantity: row.keep_quantity,
    condition: row.condition as CardCondition,
    purchasePriceMinor: row.purchase_price_minor,
    purchaseDate: row.purchase_date,
    storageLocationId: row.storage_location_id,
    note: row.note,
    availableForTrade: row.available_for_trade,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    setCode: row.set_code,
    setName: row.set_name,
    storageLocationName: row.storage_location_name,
    printing: {
      id: row.card_printing_id,
      cardId: row.card_id,
      setId: row.set_id,
      language: row.printing_language as never,
      illustrationLabel: row.illustration_label,
      isFoil: row.is_foil,
      isParallel: row.is_parallel,
      isAlternateArt: row.is_alternate_art,
      isPromo: row.is_promo,
      collectorNumber: row.collector_number,
      imageSmallUrl: row.image_small_url,
      imageMediumUrl: row.image_medium_url,
      imageLargeUrl: row.image_large_url,
      createdAt: row.created_at,
    },
    card: {
      id: row.card_id,
      gameId: row.game_id,
      cardNumber: row.card_number,
      name: row.card_name,
      character: row.character,
      colors: row.colors,
      category: row.category as never,
      rarity: row.rarity,
      cost: row.cost,
      power: row.power,
      counter: row.counter,
      attribute: row.attribute,
      traits: row.traits,
      text: row.card_text,
      isLeader: row.is_leader,
      primarySetId: row.set_id,
      metadata: {},
      createdAt: row.created_at,
      updatedAt: row.created_at,
    },
  };
}

export type CollectionSortKey =
  | "recent"
  | "quantity"
  | "name"
  | "set_code"
  | "rarity"
  | "character";

export interface CollectionFilters {
  setCode?: string;
  character?: string;
  rarity?: string;
  color?: string;
  availableForTradeOnly?: boolean;
  /** Doubles view: only rows with surplus (quantity > keep_quantity). */
  doublesOnly?: boolean;
}

const SORT_COLUMN: Record<CollectionSortKey, string> = {
  recent: "created_at",
  quantity: "quantity",
  name: "card_name",
  set_code: "set_code",
  rarity: "rarity",
  character: "character",
};

/** The user's own collection, filtered/sorted/paginated server-side (section 2/11/12). */
export async function getUserCollection(
  supabase: TypedSupabaseClient,
  userId: ID,
  filters: CollectionFilters,
  sort: CollectionSortKey,
  pagination: { page?: number; pageSize?: number },
): Promise<PaginatedResult<CollectionEntryWithCard>> {
  const { page, pageSize } = normalizePagination(pagination);
  const { from, to } = toRange(page, pageSize);

  let query = supabase
    .from("collection_entries_detailed")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  if (filters.setCode) query = query.eq("set_code", filters.setCode);
  if (filters.character) query = query.eq("character", filters.character);
  if (filters.rarity) query = query.eq("rarity", filters.rarity);
  if (filters.color) query = query.contains("colors", [filters.color]);
  if (filters.availableForTradeOnly) query = query.eq("available_for_trade", true);
  if (filters.doublesOnly) query = query.gt("surplus", 0);

  const { data, count, error } = await query
    .order(SORT_COLUMN[sort], { ascending: sort !== "recent" && sort !== "quantity" })
    .range(from, to);
  if (error) throw error;

  return buildPaginatedResult((data ?? []).map(mapDetailedRow), count ?? 0, page, pageSize);
}

export async function getDoubles(
  supabase: TypedSupabaseClient,
  userId: ID,
  pagination: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<CollectionEntryWithCard>> {
  return getUserCollection(supabase, userId, { doublesOnly: true }, "quantity", pagination);
}

export async function getCollectionStats(supabase: TypedSupabaseClient): Promise<CollectionStats> {
  const [{ data: statsRows, error: statsError }, recentResult] = await Promise.all([
    supabase.rpc("get_my_collection_stats"),
    supabase
      .from("collection_entries_detailed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  if (statsError) throw statsError;
  if (recentResult.error) throw recentResult.error;

  const stats = statsRows?.[0];

  return {
    totalCards: stats?.total_cards ?? 0,
    uniquePrintings: stats?.unique_printings ?? 0,
    totalPurchasePriceMinor: stats?.total_purchase_price_minor ?? null,
    // No PriceProvider wired yet (Phase 5) — never fabricate a number here.
    estimatedValueMinor: null,
    gainLossMinor: null,
    doublesCount: stats?.doubles_count ?? 0,
    gradedCardsCount: stats?.graded_cards_count ?? 0,
    sealedProductsCount: stats?.sealed_products_count ?? 0,
    recentlyAdded: (recentResult.data ?? []).map(mapDetailedRow),
  };
}
