import type { GeneratedItem } from "../data/itemCatalog";
import type { ItemResearchState, ResearchRecord, ResearchStatus } from "./types";

/**
 * Resolves parsed `.plr` research records against the item catalog
 * (`items.json`, keyed by internal name — see scripts/generate-items.ts).
 *
 * Items with no matching record are treated as having zero sacrificed
 * (brief §11: "If there is no record, treat the item as having zero
 * sacrificed count.").
 */
export function resolveResearchState(
  records: ResearchRecord[],
  catalog: Record<string, GeneratedItem>,
): Record<string, ItemResearchState> {
  const sacrificedByName = new Map<string, number>();
  for (const r of records) sacrificedByName.set(r.internalName, r.sacrificed);

  const result: Record<string, ItemResearchState> = {};
  for (const internalName of Object.keys(catalog)) {
    const needed = catalog[internalName].needed;
    const sacrificed = sacrificedByName.get(internalName) ?? 0;
    result[internalName] = { sacrificed, needed, status: statusOf(sacrificed, needed) };
  }
  return result;
}

function statusOf(sacrificed: number, needed: number): ResearchStatus {
  if (sacrificed >= needed) return "complete";
  if (sacrificed > 0) return "partial";
  return "missing";
}
