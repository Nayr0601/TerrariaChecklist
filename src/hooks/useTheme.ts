import { useEffect } from "react";
import { DEFAULT_THEME, THEME_IDS, type ThemeId } from "../data/themes";
import { useLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "journey-ledger:theme";

/**
 * Persists the chosen palette (see [[theme-switcher]]) and stamps it onto
 * `<html data-theme>`, which `theme.css`'s `:root[data-theme="…"]` blocks
 * key off of. Lives on `<html>` rather than the app root so it also covers
 * anything rendered outside `#root` (e.g. a future portal/modal).
 */
export function useTheme(): [ThemeId, (id: ThemeId) => void] {
  const [theme, setTheme] = useLocalStorage<ThemeId>(STORAGE_KEY, DEFAULT_THEME);
  const safeTheme = THEME_IDS.includes(theme) ? theme : DEFAULT_THEME;

  useEffect(() => {
    const root = document.documentElement;
    if (safeTheme === DEFAULT_THEME) {
      root.removeAttribute("data-theme");
    } else {
      root.dataset.theme = safeTheme;
    }
  }, [safeTheme]);

  return [safeTheme, setTheme];
}
