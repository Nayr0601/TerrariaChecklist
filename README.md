# Journey Ledger — Terraria Completion Tracker

A static, client-side Terraria **Journey Mode research tracker** and **progression checklist** (bosses, events, town NPCs). Built with Vite + React + TypeScript.

Your `.plr` save file is decrypted and parsed entirely in your browser. It is never uploaded, and there is no backend — the whole app is static HTML/CSS/JS you can host anywhere.

## Contents

- [Development](#development)
- [Privacy](#privacy)
- [Data regeneration (`items.json`)](#data-regeneration-itemsjson)
- [Categories](#categories)
- [Sprites](#sprites)
- [Adding progression content](#adding-progression-content)
- [`.plr` parser](#plr-parser)
- [Deployment](#deployment)
- [Attribution](#attribution)

## Development

Requires Node 18+ (developed against Node 22).

```bash
npm install

# Regenerate src/data/items.json from the source CSVs, then start Vite.
# (npm run dev already does this via its predev hook.)
npm run dev

# Type-check only
npm run typecheck

# Run the test suite (regenerates items.json + synthetic .plr test
# fixtures first, via the pretest hook)
npm test

# Production build (also regenerates items.json first, via prebuild)
npm run build
npm run preview   # serve the dist/ build locally
```

Project structure:

```text
pre-data/         Reference/source material (design doc, research-reader
                   prototype, source CSVs) — not shipped, read by scripts/
scripts/           Build-time tooling (CSV -> src/data/items.json)
src/
  parser/          .plr decryption + binary parsing (no React, no DOM APIs
                   beyond Web Crypto — testable in plain Node)
  data/            Item catalog, categories, progression content, rarity
                   colors, wiki links, sprite resolution — all data, no UI
  hooks/           React state glue (localStorage, filtering, file loading)
  components/      Presentational building blocks
  views/           ItemsView / ProgressionView, composed in App.tsx
  styles/          Theme tokens + global stylesheet
tests/
  parser/          Parser unit + integration tests
  data/            Data-pipeline tests (CSV join, category heuristic)
  fixtures/        Synthetic .plr generator + generated (gitignored) output
```

## Privacy

- The `.plr` file is read with the browser's `File` API and decrypted with `crypto.subtle` (Web Crypto) — see `src/parser/crypto.ts`.
- There is no server, no API route, and no telemetry required for the app to function.
- Nothing derived from your save is persisted except the small per-item research-status map kept in memory for the current session, plus (optionally) the localStorage-backed preferences described in "Local persistence" below. The raw decrypted save bytes are never stored anywhere.

## Data regeneration (`items.json`)

`src/data/items.json` is a **generated** file — do not hand-edit it. It's produced by [scripts/generate-items.ts](scripts/generate-items.ts) from two source spreadsheets in [pre-data/](pre-data/):

- `Terraria Items - Sheet1.csv` — columns `ID, Name, Internal name` (the master catalog, ~6,195 rows)
- `Terraria Items - Research List.csv` — columns `ID, Name, Research` (Journey research requirements)

The join is by `ID`. **An item is only included when `Research` is present and greater than 0** — a blank or zero research value means the item isn't researchable in Journey Mode and is excluded. This currently yields **6,133 researchable items**, keyed in the output by internal name (the same name a decrypted `.plr` research record uses):

```json
{
  "IronPickaxe": { "id": 1, "displayName": "Iron Pickaxe", "internalName": "IronPickaxe", "needed": 1, "category": "Tools" }
}
```

Regenerate after editing either CSV (or dropping in new ones for a future Terraria patch — keep the same filenames/column headers in `pre-data/`, or update the paths at the top of the script):

```bash
npm run generate:items
```

The script logs a per-category breakdown so you can sanity-check the result.

## Categories

The app groups items into 11 categories (plus the "All Items" filter): Weapons, Armor, Vanity, Equipment, Accessories, Consumables, Tools, Blocks & Walls, Furniture, Materials, Misc.

Four of those are backed by curated ID lists in [pre-data/categories/](pre-data/categories/) — community-compiled item databases (`Terraria_Items_-_Weapons_with_IDs.csv`, `..._Armor_Expanded.csv`, `..._Consumables_with_IDs.csv`, `Terraria_Vanity_Items_Expanded.csv`), loaded at build time by [scripts/loadCategoryOverrides.ts](scripts/loadCategoryOverrides.ts). An item's ID membership in one of these lists always wins. A few IDs appear in more than one list (every explosive is listed as both a weapon and a consumable; Ninja/Rain gear as both armor and vanity) — Consumables wins over Weapons, and Armor wins over Vanity, in `categorize()`.

Everything else — including "Equipment" entirely, which has no curated list — still uses the original approach: neither source CSV includes a category column, so the rest is derived by a transparent, best-effort **lexical heuristic** over each item's display name, using Terraria's own fairly consistent naming conventions (ammo is named "... Arrow"/"... Bullet", grappling hooks say "Hook", etc). Tools is checked first, even before the CSV lists, because the Weapons CSV reasonably includes pickaxes/drills/chainsaws (they have a Damage stat) but this app wants those in Tools.

All of this logic lives in [src/data/categories.ts](src/data/categories.ts). Regex rules are ordered most-specific-first and the first match wins; anything matching nothing lands in **"Misc"** rather than being force-fit into a wrong bucket — that includes every item type this 11-category scheme dropped from an earlier, more granular version (Food, Banners, Paintings, Dyes, Seeds & Plants, Critters & Pets). Category assignment happens once, at build time, in `scripts/generate-items.ts`, and is baked into `items.json`.

To improve accuracy:

- **Easiest** — edit the regex rules in `categories.ts`, then `npm run generate:items`.
- **For the 4 CSV-backed categories** — edit the relevant file in `pre-data/categories/` (or swap in a more complete one).
- **For Equipment specifically** — most pets and many mounts have names sharing no reliable common word (nothing links "Ivy Whip", "Web Slinger", "Slimy Saddle"), so this category is inherently the least complete; `NAME_OVERRIDES` in `categories.ts` is the escape hatch for hand-correcting specific items.

No UI code depends on how a category was derived — `ItemRow`, `Sidebar`, etc. just read `item.category` as a plain string.

## Sprites

Item tiles resolve a sprite by **item ID** from `src/assets/sprites/<id>.png` (e.g. `8.png` for Torch, item ID 8) via `src/data/sprites.ts`; boss tiles in the Progression view resolve one by **entry id** from `src/assets/boss-sprites/<id>.png` (e.g. `king-slime.png`) via `src/data/bossSprites.ts`. Both use a single build-time `import.meta.glob` — not one network request per item — and both folders are `.gitignore`d rather than committed, since the art is extracted from the game's own files (© Re-Logic; see "Attribution" below), so a fresh clone falls back to the pixel-font initials placeholder until you add your own.

To add sprites: drop `<itemId>.png` files into `src/assets/sprites/`, or `<bossEntryId>.png` (matching the `id` in `src/data/progression.ts`, e.g. `moon-lord.png`) into `src/assets/boss-sprites/`. Nothing else needs to change — resolution happens automatically per-item/per-boss, falling back to the placeholder for anything without a matching file.

## Adding progression content

Bosses, events, and NPCs live in one hand-authored data file, [src/data/progression.ts](src/data/progression.ts), completely separate from `ProgressionView`/`ProgressionSectionView`/`ProgressionTile` (the UI just maps over it). To add an entry:

```ts
{ id: "stable-unique-slug", name: "Display Name", tier: "orange" }
```

to the relevant section's `entries` array (or add a whole new `ProgressionSection` to the top-level array for a new grouping). `id` is the localStorage key for that entry's checked state — don't change an existing entry's `id` after users may have checked it, or it'll appear unchecked again. `tier` only controls the rarity-ladder accent color (`src/data/rarity.ts`) and is a hand-picked rough progression ordering, not an authoritative game value.

## Local persistence

Stored in `localStorage`, all under a `journey-ledger:` prefix:

- Progression checklist state (independent of any `.plr` upload — see below)
- Hidden (ignored) items
- Manually-marked-researched overrides (see "Mark researched", below)
- The item-list display preferences (show unchecked/checked/ignored) and chosen theme

**Not** persisted: the raw `.plr` file or its decrypted contents, or anything else derived from your save — reloading the page clears the loaded character and you re-select the file.

### Progression view independence

The Progression view's state is deliberately **not** derived from or coupled to Journey research data in any way — it's its own `localStorage`-backed checklist you tick by hand, and it works identically with or without ever loading a `.plr`.

### "Mark researched"

This is a **local, manual override** layered on top of whatever the loaded save says — it never edits or reinterprets your save file (this is a reader, not an editor; see `src/parser/plrParser.ts`'s doc comment). It's disabled for items your save already reports as researched (nothing to override), and only lets you flag an item complete in your own tracker — e.g. for browsing/planning without a save loaded, or if you know you've since researched something your last-loaded save predates. Toggling it off reverts to whatever the save (or absence of one) says.

## `.plr` parser

Source: [src/parser/](src/parser/). Fully covered by tests in [tests/parser/](tests/parser/) — see [tests/fixtures/generate-fixtures.ts](tests/fixtures/generate-fixtures.ts) for how the synthetic test saves are constructed (no real Terraria save file was supplied with this project, so fixtures are built from scratch to match the documented format and AES-encrypted with the real key via Node's `node:crypto` — the app itself only ever uses the browser's Web Crypto API).

**Encryption** ([crypto.ts](src/parser/crypto.ts)): AES-128-CBC, where both the key and IV are the UTF-16LE bytes of the literal string `h3y_gUyZ` (16 bytes). Decrypted via `crypto.subtle.decrypt`, which also validates and strips PKCS#7 padding as part of the call.

**Header** ([playerHeader.ts](src/parser/playerHeader.ts)): reads the fixed-layout `int32 version`, 7-byte `"relogic"` magic, `fileType` byte, `uint32 revision`, `uint64 favorited`, then the 7-bit-length-prefixed character name (offset 24) — this layout has been stable across the 1.4.x range. `version` is returned so later logic can branch on it.

**Research block** ([researchParser.ts](src/parser/researchParser.ts)): the block's *exact* byte offset is genuinely version-dependent — it sits after a long, version-specific run of other player fields (difficulty, appearance, loadouts, ...), and per the format itself is followed by more trailing per-version flag data, so there's no single fixed offset that works across releases. Rather than hand-model every version's preceding field layout, the parser scans forward for an `int32` that is immediately followed by exactly that many well-formed `[nameLen:u8][name][sacrificed:i32]` records in a row, where a record only validates if its name is alphanumeric-or-underscore (the actual character set used across every internal item name — a small number of items, like the wire logic gates, include underscores, which an early version of this scan incorrectly rejected until the full-catalog test caught it) at a plausible length and its count is small and plausible. When multiple offsets validate, the one with the **largest** record count wins — always the real block, never an incidental match in filler bytes. This is deliberately close to the well-tested approach in `pre-data/terraria-research-reader.html` (an earlier prototype bundled with this project), which the full `items.json`-backed test suite here further hardened.

**Result** ([plrParser.ts](src/parser/plrParser.ts), [types.ts](src/parser/types.ts)): `parsePlrFile()` never throws — it returns a discriminated union (`ok: true` with header + research records, or `ok: false` with `kind: "corrupt" | "not-journey"` and a human-readable message) so the UI always has something sensible to render, including for a valid non-Journey character (Classic/Mediumcore/Hardcore saves simply have no research block at all — that's treated as its own clear outcome, not an error).

## Deployment

The build outputs a fully static `dist/` folder.

```bash
npm run build
```

`vite.config.ts` sets `base: "./"` (relative asset paths), so the same build works unmodified at a domain root **or** a subpath — no separate `base` config needed for GitHub Pages.

- **Netlify / Vercel**: point the build command at `npm run build` and the publish/output directory at `dist`. Both auto-detect Vite; no extra config required.
- **GitHub Pages**: build, then publish `dist/` to the `gh-pages` branch (or via a "deploy from a branch/folder" Pages setting, or a `peaceiris/actions-gh-pages`-style GitHub Action). Because of the relative `base`, this works whether the repo is served at `https://<user>.github.io/` or `https://<user>.github.io/<repo>/`.

## Performance

~6,133 items is enough that mounting every row's DOM at once is noticeably janky, so the item list ([src/components/ItemList.tsx](src/components/ItemList.tsx)) is virtualized with `react-window` — only rows actually in view (plus a small overscan buffer) are ever mounted. Filtering/search runs over the flat in-memory catalog with a memoized predicate; category completion stats are memoized separately so typing in the search box doesn't recompute sidebar percentages.

The generated `items.json` (~6,133 items × id/name/needed/category) is bundled as a single ~200KB-gzipped chunk, fetched once and cached — not one request per item. That's the majority of the production JS bundle size; it's an expected, one-time cost rather than something worth code-splitting away for this app's scope.

## Attribution

Terraria, its items, bosses, and all game content referenced here are © [Re-Logic](https://re-logic.com/). This is an unofficial, fan-made tool for players to inspect their own local save data; it is not affiliated with or endorsed by Re-Logic. Item names and IDs are drawn from publicly available Terraria data (the source CSVs bundled in `pre-data/`); no game assets beyond publicly known names/IDs are redistributed, and any sprites you add locally under `src/assets/sprites/` (items) or `src/assets/boss-sprites/` (bosses) remain your own responsibility to source appropriately.

Fonts: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P), [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans), and [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts (Open Font License).

Libraries: [React](https://react.dev/), [Vite](https://vitejs.dev/), [react-window](https://github.com/bvaughn/react-window), [Vitest](https://vitest.dev/).
