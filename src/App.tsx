import { useRef, useState } from "react";
import { Header } from "./components/Header";
import { ItemsView } from "./views/ItemsView";
import { ProgressionView } from "./views/ProgressionView";
import { usePlrFile } from "./hooks/usePlrFile";
import { useTheme } from "./hooks/useTheme";
import { usePersistentSet } from "./hooks/usePersistentSet";
import { useLocalStorage } from "./hooks/useLocalStorage";

type View = "items" | "progression";

export default function App() {
  const [view, setView] = useState<View>("items");
  const { state, loadFile, reset } = usePlrFile();
  const [theme, setTheme] = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Item-list display filters — live here (not in ItemsView) so the header's
  // settings dropdown, a sibling of ItemsView, can control them too.
  const hidden = usePersistentSet("journey-ledger:hidden-items");
  const [showUnchecked, setShowUnchecked] = useLocalStorage("journey-ledger:show-unchecked-items", true);
  const [showChecked, setShowChecked] = useLocalStorage("journey-ledger:show-checked-items", false);
  const [showIgnored, setShowIgnored] = useLocalStorage("journey-ledger:show-ignored-items", false);
  // Off by default (matches the game's own "?????" silhouette for
  // unresearched items); on, names are always shown regardless of status.
  const [showItemNames, setShowItemNames] = useLocalStorage("journey-ledger:show-item-names", false);

  const hasSave = state.status === "ready";
  const worldLabel =
    state.status === "ready"
      ? `${state.header.name} · ${state.fileName}`
      : state.status === "not-journey"
        ? `${state.header.name} · not Journey mode`
        : state.status === "loading"
          ? `Reading ${state.fileName}…`
          : "NO CHARACTER LOADED";

  return (
    <div className="app-shell">
      <Header
        view={view}
        onChangeView={setView}
        worldLabel={worldLabel}
        hasSave={hasSave}
        onEject={reset}
        onChooseFile={() => fileInputRef.current?.click()}
        showUnchecked={showUnchecked}
        showChecked={showChecked}
        showIgnored={showIgnored}
        onToggleShowUnchecked={() => setShowUnchecked((v) => !v)}
        onToggleShowChecked={() => setShowChecked((v) => !v)}
        onToggleShowIgnored={() => setShowIgnored((v) => !v)}
        showItemNames={showItemNames}
        onToggleShowItemNames={() => setShowItemNames((v) => !v)}
        theme={theme}
        onChangeTheme={setTheme}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".plr"
        tabIndex={-1}
        aria-hidden="true"
        className="visually-hidden-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadFile(file);
          e.target.value = "";
        }}
      />

      {view === "items" ? (
        <ItemsView
          plrState={state}
          onLoadFile={loadFile}
          hidden={hidden}
          showUnchecked={showUnchecked}
          showChecked={showChecked}
          showIgnored={showIgnored}
          showItemNames={showItemNames}
        />
      ) : (
        <ProgressionView />
      )}

      <footer className="app-footer">
        <span className="app-footer__text">JOURNEY MODE · RESEARCH LEDGER</span>
        <span style={{ flex: 1 }} />
        <span className="app-footer__text">
          {view === "items" ? "CLICK ✓ TO MARK RESEARCHED · ⊘ HIDES A ROW" : "CLICK A SLOT TO STAMP IT"}
        </span>
      </footer>
    </div>
  );
}
