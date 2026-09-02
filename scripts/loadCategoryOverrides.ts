/**
 * Loads the curated ID lists in `pre-data/categories/*.csv` — community-
 * compiled item databases (not hand-guessed) that back 4 of the 11
 * categories: Weapons, Armor, Vanity, Consumables. `categorize()` in
 * `src/data/categories.ts` checks these before falling back to its name
 * heuristic for everything else.
 *
 * A handful of item IDs appear in more than one file — e.g. every
 * explosive (Bomb, Dynamite, ...) is listed as both a weapon and a
 * consumable, and Ninja/Rain gear as both armor and vanity — so precedence
 * matters: Consumables wins over Weapons (an item you use up beats one you
 * swing), and Armor wins over Vanity (real stats beat "also technically
 * wearable as vanity"). Enforced by check order in `categorize()`, not here.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvRecords } from "./csv.ts";
import type { CategoryOverrides } from "../src/data/categories.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dirname, "..", "pre-data/categories");

function idSet(fileName: string): Set<number> {
  const records = parseCsvRecords(readFileSync(resolve(DIR, fileName), "utf-8"));
  const ids = new Set<number>();
  for (const row of records) {
    const id = Number(row["ID"]);
    if (Number.isFinite(id) && id > 0) ids.add(id);
  }
  return ids;
}

export function loadCategoryOverrides(): CategoryOverrides {
  return {
    weaponIds: idSet("Terraria_Items_-_Weapons_with_IDs.csv"),
    armorIds: idSet("Terraria_Items_-_Armor_Expanded.csv"),
    vanityIds: idSet("Terraria_Vanity_Items_Expanded.csv"),
    consumableIds: idSet("Terraria_Items_-_Consumables_with_IDs.csv"),
  };
}
