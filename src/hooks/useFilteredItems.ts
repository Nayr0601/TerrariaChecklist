import { useMemo } from "react";
import { itemCatalogList, type GeneratedItem } from "../data/itemCatalog";
import type { ItemResearchState } from "../parser/types";

interface Options {
  category: string;
  query: string;
  showUnchecked: boolean;
  showChecked: boolean;
  showIgnored: boolean;
  hidden: Set<string>;
  researchState: Record<string, ItemResearchState> | null;
  manualOverrides: Set<string>;
}

const ALL = "All Items";

/**
 * Search/category/status/ignored filtering for the item list. The status
 * axis (checked/unchecked) and the ignored axis are independent switches
 * (see the header's settings dropdown, `SettingsMenu`): an item needs both
 * its status visibility and its ignored visibility on to show up.
 */
export function useFilteredItems({
  category,
  query,
  showUnchecked,
  showChecked,
  showIgnored,
  hidden,
  researchState,
  manualOverrides,
}: Options): GeneratedItem[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase();

    return itemCatalogList.filter((item) => {
      if (category !== ALL && item.category !== category) return false;
      if (q) {
        const matchesName = item.displayName.toLowerCase().includes(q);
        const matchesId = String(item.id) === q;
        if (!matchesName && !matchesId) return false;
      }

      const ignored = hidden.has(item.internalName);
      if (ignored && !showIgnored) return false;

      const status = researchState?.[item.internalName]?.status ?? "missing";
      const isComplete = status === "complete" || manualOverrides.has(item.internalName);
      if (isComplete ? !showChecked : !showUnchecked) return false;

      return true;
    });
  }, [category, query, showUnchecked, showChecked, showIgnored, hidden, researchState, manualOverrides]);
}

export const ALL_ITEMS = ALL;
