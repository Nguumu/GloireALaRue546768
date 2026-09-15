"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Button, Input } from "@tcg/ui";
import { CARD_CONDITIONS } from "@tcg/types";
import { addToCollectionAction, type CollectionActionState } from "@/actions/collection";
import { CONDITION_LABELS } from "@/lib/labels";

const initialState: CollectionActionState = { error: null };

export function AddToCollectionForm({ cardPrintingId }: { cardPrintingId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addToCollectionAction, initialState);

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        + Ajouter à ma collection
      </Button>
    );
  }

  if (state.success) {
    return (
      <p className="text-xs text-emerald-600 dark:text-emerald-400">
        Ajoutée à votre collection.{" "}
        <button className="underline" onClick={() => setOpen(false)}>
          Fermer
        </button>
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-lg border border-surface-200 p-3 text-sm dark:border-surface-700">
      <input type="hidden" name="cardPrintingId" value={cardPrintingId} />
      <div className="flex gap-2">
        <Input type="number" name="quantity" defaultValue={1} min={1} max={999} className="w-20" aria-label="Quantité" />
        <select
          name="condition"
          defaultValue="NEAR_MINT"
          className="h-10 flex-1 rounded-lg border border-surface-300 bg-white px-2 text-sm dark:border-surface-700 dark:bg-surface-900"
          aria-label="État"
        >
          {CARD_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {CONDITION_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <Input name="storageLocationName" placeholder="Emplacement (ex: Binder 1, Page 3)" />
      <div className="flex gap-2">
        <Input type="number" step="0.01" min={0} name="purchasePriceEuros" placeholder="Prix d'achat (€)" />
        <Input type="date" name="purchaseDate" />
      </div>
      <Input name="note" placeholder="Note (optionnel)" />
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Ajouter
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
