/**
 * Deterministic Terraria Wiki link generation, isolated from item-row UI
 * code (brief §20). The official wiki (terraria.wiki.gg) keys pages by
 * display name with spaces replaced by underscores, which is reliable for
 * the vast majority of items and requires no per-item mapping table.
 */
const WIKI_BASE = "https://terraria.wiki.gg/wiki/";

export function wikiUrlForItem(displayName: string): string {
  return WIKI_BASE + encodeURIComponent(displayName.trim().replace(/\s+/g, "_"));
}
