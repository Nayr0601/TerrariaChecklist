import { SettingsMenu } from "./SettingsMenu";
import type { ThemeId } from "../data/themes";

type View = "items" | "progression";

interface Props {
  view: View;
  onChangeView: (v: View) => void;
  worldLabel: string;
  hasSave: boolean;
  onEject: () => void;
  onChooseFile: () => void;
  showUnchecked: boolean;
  showChecked: boolean;
  showIgnored: boolean;
  onToggleShowUnchecked: () => void;
  onToggleShowChecked: () => void;
  onToggleShowIgnored: () => void;
  theme: ThemeId;
  onChangeTheme: (t: ThemeId) => void;
  mobileExtra?: React.ReactNode;
}

export function Header({
  view,
  onChangeView,
  worldLabel,
  hasSave,
  onEject,
  onChooseFile,
  showUnchecked,
  showChecked,
  showIgnored,
  onToggleShowUnchecked,
  onToggleShowChecked,
  onToggleShowIgnored,
  theme,
  onChangeTheme,
  mobileExtra,
}: Props) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__diamond" aria-hidden="true" />
        <div className="app-header__wordmark">
          <span className="app-header__logo">JOURNEY LEDGER</span>
          <span className="app-header__logo-sub">TERRARIA COMPLETION TRACKER</span>
        </div>
      </div>

      <div className="app-header__tabs" role="tablist" aria-label="View">
        <button
          type="button"
          role="tab"
          aria-selected={view === "items"}
          className="tab-btn"
          onClick={() => onChangeView("items")}
        >
          ITEMS
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "progression"}
          className="tab-btn"
          onClick={() => onChangeView("progression")}
        >
          PROGRESSION
        </button>
      </div>

      <div className="app-header__meta">
        <span className="world-label">{worldLabel}</span>
        <SettingsMenu
          showUnchecked={showUnchecked}
          showChecked={showChecked}
          showIgnored={showIgnored}
          onToggleShowUnchecked={onToggleShowUnchecked}
          onToggleShowChecked={onToggleShowChecked}
          onToggleShowIgnored={onToggleShowIgnored}
          theme={theme}
          onChangeTheme={onChangeTheme}
        />
        <button type="button" className="btn-primary" onClick={hasSave ? onEject : onChooseFile}>
          {hasSave ? "EJECT .PLR" : "UPLOAD .PLR"}
        </button>
      </div>

      {mobileExtra}
    </header>
  );
}
