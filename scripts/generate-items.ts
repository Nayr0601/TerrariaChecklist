/**
 * Build-time data pipeline: joins the two source CSVs into `src/data/items.json`.
 *
 * Source of truth:
 *   - pre-data/Terraria Items - Sheet1.csv        (ID, Name, Internal name)   ~6,195 rows
 *   - pre-data/Terraria Items - Research List.csv (ID, Name, Research)        ~6,145 rows
 *
 * Join key: ID.
 * Inclusion rule: only emit an item when Research is present AND > 0.
 * Output key: the item's internal name (matches what a decrypted .plr
 * research record stores), see src/parser/researchParser.ts.
 *
 * Run with `npm run generate:items`. Re-run whenever the source CSVs change
 * (e.g. after a Terraria content patch) — nothing about the item catalog is
 * hand-maintained in TypeScript.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvRecords } from "./csv.ts";
import { categorize } from "../src/data/categories.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SHEET_CSV = resolve(ROOT, "pre-data/Terraria Items - Sheet1.csv");
const RESEARCH_CSV = resolve(ROOT, "pre-data/Terraria Items - Research List.csv");
const OUT_FILE = resolve(ROOT, "src/data/items.json");

export interface GeneratedItem {
  id: number;
  displayName: string;
  internalName: string;
  needed: number;
  category: string;
}

function main() {
  const sheetRows = parseCsvRecords(readFileSync(SHEET_CSV, "utf-8"));
  const researchRows = parseCsvRecords(readFileSync(RESEARCH_CSV, "utf-8"));

  // ID -> { displayName, internalName } from the master catalog.
  const byId = new Map<number, { displayName: string; internalName: string }>();
  for (const row of sheetRows) {
    const id = Number(row["ID"]);
    if (!Number.isFinite(id)) continue;
    const internalName = (row["Internal name"] ?? "").trim();
    const displayName = (row["Name"] ?? "").trim();
    if (!internalName || !displayName) continue;
    byId.set(id, { displayName, internalName });
  }

  const items: Record<string, GeneratedItem> = {};
  let skippedNoResearch = 0;
  let skippedNoCatalogMatch = 0;
  let duplicateInternalNames = 0;

  for (const row of researchRows) {
    const id = Number(row["ID"]);
    const researchRaw = (row["Research"] ?? "").trim();
    const needed = researchRaw === "" ? 0 : Number(researchRaw);

    if (!Number.isFinite(needed) || needed <= 0) {
      skippedNoResearch++;
      continue;
    }

    const catalogEntry = byId.get(id);
    if (!catalogEntry) {
      skippedNoCatalogMatch++;
      continue;
    }

    const { internalName, displayName } = catalogEntry;
    if (items[internalName]) {
      duplicateInternalNames++;
      continue;
    }

    items[internalName] = {
      id,
      displayName,
      internalName,
      needed,
      category: categorize(displayName),
    };
  }

  const count = Object.keys(items).length;

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(items, null, 2) + "\n", "utf-8");

  // Category breakdown, useful when tuning scripts/categorize.ts.
  const byCategory = new Map<string, number>();
  for (const item of Object.values(items)) {
    byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1);
  }

  console.log(`Wrote ${count} researchable items to ${OUT_FILE}`);
  console.log(
    `  skipped (no/zero research): ${skippedNoResearch}, skipped (no catalog match): ${skippedNoCatalogMatch}, duplicate internal names: ${duplicateInternalNames}`,
  );
  console.log("  by category:");
  for (const [cat, n] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat.padEnd(18)} ${n}`);
  }
}

main();
