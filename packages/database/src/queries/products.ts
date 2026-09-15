import type { ID } from "@tcg/types";
import type { TypedSupabaseClient } from "../client/types";
import { mapProductRow } from "../mappers";
import type { Database } from "../types/database.types";

/** "Disponible dans :" — products a set of printings can be pulled from (section 7). */
export async function getProductsForPrintings(
  supabase: TypedSupabaseClient,
  printingIds: ID[],
): Promise<Map<ID, ReturnType<typeof mapProductRow>[]>> {
  const result = new Map<ID, ReturnType<typeof mapProductRow>[]>();
  if (printingIds.length === 0) return result;

  const { data, error } = await supabase
    .from("card_printing_product_sources")
    .select("card_printing_id, products(*)")
    .in("card_printing_id", printingIds);
  if (error) throw error;

  for (const row of data ?? []) {
    const product = row.products as unknown as Database["public"]["Tables"]["products"]["Row"] | null;
    if (!product) continue;
    const list = result.get(row.card_printing_id) ?? [];
    list.push(mapProductRow(product));
    result.set(row.card_printing_id, list);
  }
  return result;
}
