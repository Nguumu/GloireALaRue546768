"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CardFilterDefinition } from "@tcg/tcg-core";

/**
 * Renders select/multi-select filters as URL params (section 11). Range,
 * text and boolean filters (cost, power, trait, owned) need richer controls
 * and, for "owned", collection data — deferred to Phase 2 rather than
 * shipped half-working here.
 */
export function FiltersPanel({
  basePath,
  filters,
}: {
  basePath: string;
  filters: CardFilterDefinition[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const renderable = filters.filter((f) => f.type === "select" && f.options?.length);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {renderable.map((filter) => (
        <select
          key={filter.key}
          className="h-10 rounded-lg border border-surface-300 bg-white px-3 text-sm dark:border-surface-700 dark:bg-surface-900"
          value={searchParams.get(filter.key) ?? ""}
          onChange={(e) => setParam(filter.key, e.target.value)}
          aria-label={filter.label}
        >
          <option value="">{filter.label}</option>
          {filter.options!.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
