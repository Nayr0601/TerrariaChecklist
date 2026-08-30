/**
 * Terraria's rarity color ladder, used to tint progression entries (bosses,
 * events, NPCs — see `progression.ts`, which assigns each entry a tier by
 * hand as part of authoring that list).
 *
 * Note: this is intentionally NOT applied to the 6,133-item research
 * catalog. Neither source CSV carries a rarity value, and unlike category
 * (derivable from fairly reliable naming conventions, see `categories.ts`)
 * item rarity has no reliable textual signal — guessing it per item would
 * mean fabricating game data wholesale. Researched/unresearched/partial
 * state is what actually distinguishes item rows instead (see
 * `ItemRow.tsx`).
 *
 * Values are `--rar-*` custom property references rather than hex — each
 * theme in `theme.css` defines its own set (see [[theme-switcher]]), so a
 * tile's rarity color follows whichever palette is active instead of being
 * pinned to Cavern Torch's hues.
 */
export const RARITY_TIERS = ["white", "blue", "green", "orange", "pink", "lime", "red"] as const;
export type RarityTier = (typeof RARITY_TIERS)[number];

export const RARITY_COLORS: Record<RarityTier, string> = {
  white: "var(--rar-white)",
  blue: "var(--rar-blue)",
  green: "var(--rar-green)",
  orange: "var(--rar-orange)",
  pink: "var(--rar-pink)",
  lime: "var(--rar-lime)",
  red: "var(--rar-red)",
};

export const RARITY_LABELS: Record<RarityTier, string> = {
  white: "Common",
  blue: "Tier 1",
  green: "Tier 2",
  orange: "Tier 3",
  pink: "Tier 4",
  lime: "Tier 5",
  red: "Tier 6",
};
