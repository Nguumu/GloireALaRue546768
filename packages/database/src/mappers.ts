import type { Card, CardPrinting, CardSet, CollectionEntry, Game, Product, StorageLocation } from "@tcg/types";
import type { Database } from "./types/database.types";

type CardRow = Database["public"]["Tables"]["cards"]["Row"];
type CardPrintingRow = Database["public"]["Tables"]["card_printings"]["Row"];
type SetRow = Database["public"]["Tables"]["sets"]["Row"];
type GameRow = Database["public"]["Tables"]["games"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CollectionEntryRow = Database["public"]["Tables"]["collection_entries"]["Row"];
type StorageLocationRow = Database["public"]["Tables"]["storage_locations"]["Row"];

export function mapGameRow(row: GameRow): Game {
  return { id: row.id, code: row.code, name: row.name, isActive: row.is_active, createdAt: row.created_at };
}

export function mapSetRow(row: SetRow): CardSet {
  return {
    id: row.id,
    gameId: row.game_id,
    code: row.code,
    name: row.name,
    releaseDate: row.release_date,
    imageUrl: row.image_url,
    language: row.language as CardSet["language"],
    setType: row.set_type as CardSet["setType"],
    createdAt: row.created_at,
  };
}

export function mapCardRow(row: CardRow): Card {
  return {
    id: row.id,
    gameId: row.game_id,
    cardNumber: row.card_number,
    name: row.name,
    character: row.character,
    colors: row.colors,
    category: row.category as Card["category"],
    rarity: row.rarity,
    cost: row.cost,
    power: row.power,
    counter: row.counter,
    attribute: row.attribute,
    traits: row.traits,
    text: row.text,
    isLeader: row.is_leader,
    primarySetId: row.primary_set_id,
    metadata: (row.metadata as Card["metadata"]) ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCardPrintingRow(row: CardPrintingRow): CardPrinting {
  return {
    id: row.id,
    cardId: row.card_id,
    setId: row.set_id,
    language: row.language as CardPrinting["language"],
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
  };
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    gameId: row.game_id,
    name: row.name,
    productType: row.product_type as Product["productType"],
    setId: row.set_id,
    releaseDate: row.release_date,
    imageUrl: row.image_url,
  };
}

export function mapCollectionEntryRow(row: CollectionEntryRow): CollectionEntry {
  return {
    id: row.id,
    userId: row.user_id,
    cardPrintingId: row.card_printing_id,
    quantity: row.quantity,
    keepQuantity: row.keep_quantity,
    condition: row.condition as CollectionEntry["condition"],
    purchasePriceMinor: row.purchase_price_minor,
    purchaseDate: row.purchase_date,
    storageLocationId: row.storage_location_id,
    note: row.note,
    availableForTrade: row.available_for_trade,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapStorageLocationRow(row: StorageLocationRow): StorageLocation {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    parentId: row.parent_id,
    createdAt: row.created_at,
  };
}
