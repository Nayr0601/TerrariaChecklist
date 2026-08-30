import { useEffect, useRef, useState } from "react";
import { THEME_IDS, THEME_META, type ThemeId } from "../data/themes";

interface Props {
  showUnchecked: boolean;
  showChecked: boolean;
  showIgnored: boolean;
  onToggleShowUnchecked: () => void;
  onToggleShowChecked: () => void;
  onToggleShowIgnored: () => void;
  showItemNames: boolean;
  onToggleShowItemNames: () => void;
  theme: ThemeId;
  onChangeTheme: (id: ThemeId) => void;
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="switch-row">
      <span className="switch-row__label">{label}</span>
      <span className="switch" data-on={checked}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="switch__track" aria-hidden="true">
          <span className="switch__thumb" />
        </span>
      </span>
    </label>
  );
}

/**
 * Header settings dropdown: the item-list visibility switches (show
 * unchecked/checked/ignored) plus the theme picker, behind a single gear
 * button rather than separate always-visible controls. Lives at the App
 * level (not ItemsView) since the theme choice applies to both views — the
 * visibility switches simply have no effect while on the Progression view.
 */
export function SettingsMenu({
  showUnchecked,
  showChecked,
  showIgnored,
  onToggleShowUnchecked,
  onToggleShowChecked,
  onToggleShowIgnored,
  showItemNames,
  onToggleShowItemNames,
  theme,
  onChangeTheme,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="settings-menu" ref={rootRef}>
      <button
        type="button"
        className="icon-btn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Settings"
        title="Settings"
        onClick={() => setOpen((v) => !v)}
      >
        ⚙
      </button>

      {open && (
        <div className="settings-panel" role="menu" aria-label="Settings">
          <div className="settings-panel__section">
            <span className="settings-panel__label">DISPLAY</span>
            <SwitchRow label="Show Unchecked Items" checked={showUnchecked} onChange={onToggleShowUnchecked} />
            <SwitchRow label="Show Checked Items" checked={showChecked} onChange={onToggleShowChecked} />
            <SwitchRow label="Show Ignored Items" checked={showIgnored} onChange={onToggleShowIgnored} />
            <SwitchRow label="Show Item Names" checked={showItemNames} onChange={onToggleShowItemNames} />
            <span className="settings-panel__hint">
              {showItemNames
                ? "Item names are always shown, even for items you haven't found."
                : "Unresearched items show as “?????” until you find them."}
            </span>
          </div>

          <div className="settings-panel__section">
            <span className="settings-panel__label">THEME</span>
            <select
              className="theme-select"
              aria-label="Theme"
              value={theme}
              onChange={(e) => onChangeTheme(e.target.value as ThemeId)}
            >
              {THEME_IDS.map((id) => (
                <option key={id} value={id}>
                  {THEME_META[id].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
