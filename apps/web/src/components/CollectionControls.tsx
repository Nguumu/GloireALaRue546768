"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CardSet } from "@tcg/types";

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "recent", label: "Récemment ajoutées" },
  { value: "quantity", label: "Quantité" },
  { value: "name", label: "Nom" },
  { value: "set_code", label: "Extension" },
  { value: "rarity", label: "Rareté" },
  { value: "character", label: "Personnage" },
];

const RARITY_OPTIONS = ["Common", "Uncommon", "Rare", "Super Rare", "Secret Rare", "Leader"];
const COLOR_OPTIONS = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];

export function CollectionControls({ basePath, sets }: { basePath: string; sets: CardSet[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        className="h-10 rounded-lg border border-surface-300 bg-white px-3 text-sm dark:border-surface-700 dark:bg-surface-900"
        value={searchParams.get("sort") ?? "recent"}
        onChange={(e) => setParam("sort", e.target.value)}
        aria-label="Trier par"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            Trier : {o.label}
          </option>
        ))}
      </select>

      {sets.length > 1 && (
        <select
          className="h-10 rounded-lg border border-surface-300 bg-white px-3 text-sm dark:border-surface-700 dark:bg-surface-900"
          value={searchParams.get("set") ?? ""}
          onChange={(e) => setParam("set", e.target.value)}
          aria-label="Extension"
        >
          <option value="">Toutes les extensions</option>
          {sets.map((s) => (
            <option key={s.id} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      <select
        className="h-10 rounded-lg border border-surface-300 bg-white px-3 text-sm dark:border-surface-700 dark:bg-surface-900"
        value={searchParams.get("rarity") ?? ""}
        onChange={(e) => setParam("rarity", e.target.value)}
        aria-label="Rareté"
      >
        <option value="">Toutes rarétés</option>
        {RARITY_OPTIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        className="h-10 rounded-lg border border-surface-300 bg-white px-3 text-sm dark:border-surface-700 dark:bg-surface-900"
        value={searchParams.get("color") ?? ""}
        onChange={(e) => setParam("color", e.target.value)}
        aria-label="Couleur"
      >
        <option value="">Toutes couleurs</option>
        {COLOR_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
