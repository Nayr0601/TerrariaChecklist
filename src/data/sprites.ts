/**
 * Item ID -> sprite URL resolution.
 *
 * Sprites live at `src/assets/sprites/<itemId>.png` (e.g. `8.png` for
 * Torch, item ID 8 — see `pre-data/Terraria Items - Sheet1.csv` for IDs).
 * `.gitignore`d rather than committed — they're extracted from the game's
 * own `Item_<id>.png` icons, © Re-Logic, so this repo doesn't redistribute
 * them (see README "Attribution"); each dev drops in their own copies
 * locally. Any item without a matching file here just falls back to its
 * pixel-art initials placeholder (see `ItemTile.tsx`), so a missing sprite
 * never breaks the row — it only loses the art. That also means a fresh
 * `git clone` renders every tile as a placeholder until sprites are added.
 *
 * `import.meta.glob` resolves every sprite's *URL* eagerly in a single
 * build-time pass — cheap, since it's just string glue, not image bytes —
 * while `vite.config.ts`'s `assetsInlineLimit: 0` keeps Vite from inlining
 * these (mostly sub-4KB) PNGs as base64 into that eager JS; each stays a
 * separate hashed file that the browser fetches/caches individually, only
 * for rows actually scrolled into view (`<img loading="lazy">`).
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
