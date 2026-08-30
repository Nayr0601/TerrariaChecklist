import raw from "./items.json";

/** Shape of each entry in the generated `items.json` — keep in sync with
 * `scripts/generate-items.ts`. */
export interface GeneratedItem {
  id: number;
  displayName: string;
  internalName: string;
  needed: number;
  category: string;
}

/** The full researchable-item catalog, keyed by internal name.
 * Generated at build time from the source CSVs — see README "Data regeneration". */
export const itemCatalog: Record<string, GeneratedItem> = raw as Record<string, GeneratedItem>;

export const itemCatalogList: GeneratedItem[] = Object.values(itemCatalog);

let byIdCache: Map<number, GeneratedItem> | null = null;
export function getItemById(id: number): GeneratedItem | undefined {
  if (!byIdCache) {
    byIdCache = new Map(itemCatalogList.map((it) => [it.id, it]));
  }
  return byIdCache.get(id);
}

export const TOTAL_RESEARCHABLE_ITEMS = itemCatalogList.length;
