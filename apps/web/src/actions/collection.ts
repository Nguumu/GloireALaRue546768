"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CARD_CONDITIONS } from "@tcg/types";
import { toMinorUnits } from "@tcg/utils";
import { findOrCreateStorageLocation } from "@tcg/database";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export interface CollectionActionState {
  error: string | null;
  success?: boolean;
}

const addToCollectionSchema = z.object({
  cardPrintingId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(999),
  condition: z.enum(CARD_CONDITIONS),
  purchasePriceEuros: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  purchaseDate: z.string().optional(),
  storageLocationName: z.string().trim().max(100).optional(),
  note: z.string().trim().max(500).optional(),
});

/** Adds to (or merges with) whatever the user already owns of this printing+condition (section 8). */
export async function addToCollectionAction(
  _prev: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const parsed = addToCollectionSchema.safeParse({
    cardPrintingId: formData.get("cardPrintingId"),
    quantity: formData.get("quantity"),
    condition: formData.get("condition"),
    purchasePriceEuros: formData.get("purchasePriceEuros") ?? "",
    purchaseDate: formData.get("purchaseDate") || undefined,
    storageLocationName: formData.get("storageLocationName") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }
  const input = parsed.data;

  const { supabase, user } = await requireUser("/");

  const storageLocationId = input.storageLocationName
    ? await findOrCreateStorageLocation(supabase, user.id, input.storageLocationName)
    : null;

  const { data: existing, error: findError } = await supabase
    .from("collection_entries")
    .select("id, quantity, keep_quantity")
    .eq("user_id", user.id)
    .eq("card_printing_id", input.cardPrintingId)
    .eq("condition", input.condition)
    .maybeSingle();
  if (findError) return { error: findError.message };

  const purchasePriceMinor =
    input.purchasePriceEuros !== undefined ? toMinorUnits(input.purchasePriceEuros) : null;

  if (existing) {
    const { error } = await supabase
      .from("collection_entries")
      .update({
        quantity: existing.quantity + input.quantity,
        keep_quantity: existing.keep_quantity + input.quantity,
        purchase_price_minor: purchasePriceMinor ?? undefined,
        purchase_date: input.purchaseDate || undefined,
        storage_location_id: storageLocationId ?? undefined,
        note: input.note ?? undefined,
      })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("collection_entries").insert({
      user_id: user.id,
      card_printing_id: input.cardPrintingId,
      quantity: input.quantity,
      keep_quantity: input.quantity,
      condition: input.condition,
      purchase_price_minor: purchasePriceMinor,
      purchase_date: input.purchaseDate || null,
      storage_location_id: storageLocationId,
      note: input.note || null,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/collection");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

const updateEntrySchema = z.object({
  id: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(999),
  keepQuantity: z.coerce.number().int().min(0).max(999),
  storageLocationName: z.string().trim().max(100).optional(),
  note: z.string().trim().max(500).optional(),
  availableForTrade: z.coerce.boolean().optional(),
});

/** Direct edit from /collection — sets absolute values rather than merging. */
export async function updateCollectionEntryAction(
  _prev: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const parsed = updateEntrySchema.safeParse({
    id: formData.get("id"),
    quantity: formData.get("quantity"),
    keepQuantity: formData.get("keepQuantity"),
    storageLocationName: formData.get("storageLocationName") || undefined,
    note: formData.get("note") || undefined,
    availableForTrade: formData.get("availableForTrade") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }
  const input = parsed.data;

  const { supabase, user } = await requireUser("/collection");

  const storageLocationId = input.storageLocationName
    ? await findOrCreateStorageLocation(supabase, user.id, input.storageLocationName)
    : null;

  const { error } = await supabase
    .from("collection_entries")
    .update({
      quantity: input.quantity,
      keep_quantity: input.keepQuantity,
      storage_location_id: storageLocationId,
      note: input.note || null,
      available_for_trade: input.availableForTrade ?? false,
    })
    .eq("id", input.id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/collection");
  revalidatePath("/collection/doubles");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function deleteCollectionEntryAction(id: string): Promise<void> {
  const { supabase, user } = await requireUser("/collection");
  await supabase.from("collection_entries").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/collection");
  revalidatePath("/collection/doubles");
  revalidatePath("/dashboard");
}

export async function toggleAvailableForTradeAction(id: string, value: boolean): Promise<void> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("collection_entries")
    .update({ available_for_trade: value })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/collection/doubles");
}
