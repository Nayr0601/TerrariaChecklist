import { useRef, useState } from "react";
import { Header } from "./components/Header";
import { ItemsView } from "./views/ItemsView";
import { ProgressionView } from "./views/ProgressionView";
import { usePlrFile } from "./hooks/usePlrFile";

type View = "items" | "progression";

export default function App() {
  const [view, setView] = useState<View>("items");
  const { state, loadFile, reset } = usePlrFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      {view === "items" ? <ItemsView plrState={state} onLoadFile={loadFile} /> : <ProgressionView />}

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
