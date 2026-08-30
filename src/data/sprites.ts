/**
 * Item ID -> sprite URL resolution.
 *
 * Sprites live at `src/assets/sprites/<itemId>.png` (e.g. `8.png` for
 * Torch, item ID 8 — see `pre-data/Terraria Items - Sheet1.csv` for IDs).
 * None are bundled in this repo (no sprite sheet was supplied with the
 * project), so this resolves to an empty map today and every item tile
 * falls back to its pixel-art initials placeholder (see `ItemTile.tsx`) —
 * dropping PNGs into that folder with matching filenames is all that's
 * needed to light them up, no other code changes required.
 *
 * `import.meta.glob` resolves every sprite in a single build-time pass (so
 * this ships as ordinary bundled/hashed static assets, not one request per
 * item at runtime) and Vite's own asset pipeline handles caching and lazy
 * chunking of the resulting URLs.
 */
const modules = import.meta.glob<string>("../assets/sprites/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const spriteById = new Map<number, string>();
for (const path in modules) {
  const match = /(\d+)\.png$/.exec(path);
  if (!match) continue;
  spriteById.set(Number(match[1]), modules[path]);
}

export function getSpriteUrl(itemId: number): string | undefined {
  return spriteById.get(itemId);
}

export const SPRITE_COUNT = spriteById.size;

/**
 * Attribution: any bundled sprites are extracted from Terraria, which is
 * © Re-Logic. They are used here strictly as a personal fan-made save
 * inspector for players' own data and are not redistributed for any
 * commercial purpose. See README "Attribution".
 */
