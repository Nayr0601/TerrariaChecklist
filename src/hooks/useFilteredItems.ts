import { useMemo } from "react";
import { itemCatalogList, type GeneratedItem } from "../data/itemCatalog";
import type { ItemResearchState } from "../parser/types";

interface Options {
  category: string;
  query: string;
  missingOnly: boolean;
  hidden: Set<string>;
  researchState: Record<string, ItemResearchState> | null;
  manualOverrides: Set<string>;
}

const ALL = "All Items";

export function useFilteredItems({ category, query, missingOnly, hidden, researchState, manualOverrides }: Options): GeneratedItem[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase();

    return itemCatalogList.filter((item) => {
      if (hidden.has(item.internalName)) return false;
      if (category !== ALL && item.category !== category) return false;
      if (q) {
        const matchesName = item.displayName.toLowerCase().includes(q);
        const matchesId = String(item.id) === q;
        if (!matchesName && !matchesId) return false;
      }
      if (missingOnly) {
        const status = researchState?.[item.internalName]?.status ?? "missing";
        const isComplete = status === "complete" || manualOverrides.has(item.internalName);
        if (isComplete) return false;
      }
      return true;
    });
  }, [category, query, missingOnly, hidden, researchState, manualOverrides]);
}

export const ALL_ITEMS = ALL;
