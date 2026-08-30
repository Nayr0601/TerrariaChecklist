import { useMemo } from "react";
import { itemCatalogList } from "../data/itemCatalog";
import type { ItemResearchState } from "../parser/types";
import { percent } from "../utils/percent";

export interface CategoryStat {
  name: string;
  total: number;
  done: number;
  pct: number;
}

const ALL = "All Items";

/** Per-category (and overall "All Items") completion counts, recomputed
 * whenever the research state or manual-override / hidden sets change.
 * Hidden items are intentionally still counted here — hiding is a display
 * preference, not a completion exclusion. */
export function useCategoryStats(
  researchState: Record<string, ItemResearchState> | null,
  manualOverrides: Set<string>,
): { categories: CategoryStat[]; overall: CategoryStat } {
  return useMemo(() => {
    const totals = new Map<string, { total: number; done: number }>();
    let overallTotal = 0;
    let overallDone = 0;

    for (const item of itemCatalogList) {
      const isDone = researchState?.[item.internalName]?.status === "complete" || manualOverrides.has(item.internalName);
      const bucket = totals.get(item.category) ?? { total: 0, done: 0 };
      bucket.total++;
      if (isDone) bucket.done++;
      totals.set(item.category, bucket);
      overallTotal++;
      if (isDone) overallDone++;
    }

    const categories = [...totals.entries()]
      .map(([name, { total, done }]) => ({
        name,
        total,
        done,
        pct: percent(done, total),
      }))
      .sort((a, b) => b.total - a.total);

    const overall: CategoryStat = {
      name: ALL,
      total: overallTotal,
      done: overallDone,
      pct: percent(overallDone, overallTotal),
    };

    return { categories, overall };
  }, [researchState, manualOverrides]);
}

export const ALL_ITEMS_CATEGORY = ALL;
