"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import type { CollectionEntryWithCard } from "@tcg/types";
import { Badge, Button, CardThumbnail, Input, RarityBadge } from "@tcg/ui";
import {
  deleteCollectionEntryAction,
  toggleAvailableForTradeAction,
  updateCollectionEntryAction,
  type CollectionActionState,
} from "@/actions/collection";
import { CONDITION_LABELS } from "@/lib/labels";

const initialState: CollectionActionState = { error: null };

export function CollectionEntryCard({ entry }: { entry: CollectionEntryWithCard }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useFormState(updateCollectionEntryAction, initialState);
  const surplus = entry.quantity - entry.keepQuantity;

  return (
    <div className="flex gap-3 rounded-xl border border-surface-200 p-3 dark:border-surface-800">
      <div className="w-20 shrink-0">
        <CardThumbnail
          name={entry.card.name}
          cardNumber={entry.card.cardNumber}
          imageUrl={entry.printing.imageSmallUrl}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{entry.card.name}</span>
          <span className="text-xs text-surface-500">{entry.card.cardNumber}</span>
          <RarityBadge rarity={entry.card.rarity} />
          <Badge tone="neutral">{entry.setCode}</Badge>
          {entry.printing.isFoil && <Badge tone="warning">Foil</Badge>}
          {surplus > 0 && <Badge tone="brand">{surplus} double(s)</Badge>}
        </div>

        {!editing ? (
          <>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-surface-600 dark:text-surface-300">
              <span>Quantité : {entry.quantity}</span>
              <span>Conservées : {entry.keepQuantity}</span>
              <span>État : {CONDITION_LABELS[entry.condition]}</span>
              {entry.storageLocationName && <span>📍 {entry.storageLocationName}</span>}
            </div>
            {entry.note && <p className="text-xs text-surface-500">{entry.note}</p>}
            <label className="mt-1 flex items-center gap-2 text-xs text-surface-500">
              <input
                type="checkbox"
                defaultChecked={entry.availableForTrade}
                disabled={pending}
                onChange={(e) =>
                  startTransition(() => {
                    void toggleAvailableForTradeAction(entry.id, e.target.checked);
                  })
                }
              />
              Disponible à l&apos;échange
            </label>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                Modifier
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (confirm("Supprimer cette carte de votre collection ?")) {
                    startTransition(() => {
                      void deleteCollectionEntryAction(entry.id);
                    });
                  }
                }}
              >
                Supprimer
              </Button>
            </div>
          </>
        ) : (
          <form action={formAction} className="mt-1 flex flex-col gap-2">
            <input type="hidden" name="id" value={entry.id} />
            <div className="flex gap-2">
              <Input
                type="number"
                name="quantity"
                defaultValue={entry.quantity}
                min={0}
                max={999}
                aria-label="Quantité"
                className="w-24"
              />
              <Input
                type="number"
                name="keepQuantity"
                defaultValue={entry.keepQuantity}
                min={0}
                max={999}
                aria-label="Quantité à conserver"
                className="w-24"
              />
            </div>
            <Input name="storageLocationName" defaultValue={entry.storageLocationName ?? ""} placeholder="Emplacement" />
            <Input name="note" defaultValue={entry.note ?? ""} placeholder="Note" />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="availableForTrade" defaultChecked={entry.availableForTrade} />
              Disponible à l&apos;échange
            </label>
            {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Enregistrer
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
