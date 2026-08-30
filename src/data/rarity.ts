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
 */
export const RARITY_TIERS = ["white", "blue", "green", "orange", "pink", "lime", "red"] as const;
export type RarityTier = (typeof RARITY_TIERS)[number];

export const RARITY_COLORS: Record<RarityTier, string> = {
  white: "#e9e3da",
  blue: "#8b9dff",
  green: "#4de04d",
  orange: "#ffb64d",
  pink: "#ff5cd6",
  lime: "#b6ff3d",
  red: "#ff4d4d",
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
