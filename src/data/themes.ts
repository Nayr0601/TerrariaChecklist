/**
 * The five palettes a player can pick between (see [[theme-switcher]]).
 * Actual colors live only in `theme.css`'s `:root[data-theme="…"]` blocks —
 * this list is just the id/label/light-vs-dark metadata the picker UI needs,
 * so there's one source of truth for the colors themselves.
 *
 * `"torch"` has no `[data-theme="torch"]` block in theme.css: it's what
 * bare `:root` already defines, so selecting it just means clearing the
 * attribute (see `useTheme`).
 */
export const THEME_IDS = ["torch", "corruption", "jungle", "frost", "parchment"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const THEME_META: Record<ThemeId, { label: string; light: boolean }> = {
  torch: { label: "Cavern Torch", light: false },
  corruption: { label: "Corruption Shale", light: false },
  jungle: { label: "Jungle Depths", light: false },
  frost: { label: "Hallowed Frost", light: false },
  parchment: { label: "Guide's Parchment", light: true },
};

export const DEFAULT_THEME: ThemeId = "torch";
