/**
 * Boss `ProgressionEntry.id` -> sprite URL resolution (see `progression.ts`
 * and `ItemTile`'s sibling `src/data/sprites.ts`, which does the same for
 * items). Sprites live at `src/assets/boss-sprites/<id>.png` — e.g.
 * `king-slime.png` for the `"king-slime"` entry — so, unlike item sprites,
 * no numeric ID lookup is needed: the filename *is* the entry id.
 *
 * `.gitignore`d rather than committed, same as item sprites: these are
 * boss portrait icons extracted from the game, © Re-Logic (see README
 * "Attribution"). Any entry without a matching file — every event and town
 * NPC today, since this only covers bosses — falls back to
 * `ProgressionTile`'s pixel-art initials placeholder.
 */
const modules = import.meta.glob<string>("../assets/boss-sprites/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const spriteById = new Map<string, string>();
for (const path in modules) {
  const match = /([^/]+)\.png$/.exec(path);
  if (!match) continue;
  spriteById.set(match[1], modules[path]);
}

export function getBossSpriteUrl(entryId: string): string | undefined {
  return spriteById.get(entryId);
}

export const BOSS_SPRITE_COUNT = spriteById.size;
