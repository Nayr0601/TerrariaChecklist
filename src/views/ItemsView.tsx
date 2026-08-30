import { useState } from "react";
import type { PlrLoadState } from "../hooks/usePlrFile";
import { usePersistentSet, type PersistentSet } from "../hooks/usePersistentSet";
import { useCategoryStats } from "../hooks/useCategoryStats";
import { useFilteredItems, ALL_ITEMS } from "../hooks/useFilteredItems";
import { itemCatalog, TOTAL_RESEARCHABLE_ITEMS } from "../data/itemCatalog";
import { percent } from "../utils/percent";
import { Sidebar } from "../components/Sidebar";
import { MobileCategoryDrawer } from "../components/MobileCategoryDrawer";
import { ItemList } from "../components/ItemList";
import { DropZone } from "../components/DropZone";
import { StatusBanner } from "../components/StatusBanner";
import { ItemInfoModal } from "../components/ItemInfoModal";

interface Props {
  plrState: PlrLoadState;
  onLoadFile: (file: File) => void;
  hidden: PersistentSet;
  showUnchecked: boolean;
  showChecked: boolean;
  showIgnored: boolean;
}

export function ItemsView({ plrState, onLoadFile, hidden, showUnchecked, showChecked, showIgnored }: Props) {
  const [category, setCategory] = useState(ALL_ITEMS);
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoItem, setInfoItem] = useState<string | null>(null);

  const manual = usePersistentSet("journey-ledger:manual-researched");

  const researchState = plrState.status === "ready" ? plrState.research : null;
  const hasProgress = researchState !== null || manual.size > 0;

  const { categories, overall } = useCategoryStats(researchState, manual.ids);
  const items = useFilteredItems({
    category,
    query,
    showUnchecked,
    showChecked,
    showIgnored,
    hidden: hidden.ids,
    researchState,
    manualOverrides: manual.ids,
  });

  const infoEntry = infoItem ? itemCatalog[infoItem] : undefined;

  return (
    <div className="view-body">
      <Sidebar
        overall={overall}
        categories={categories}
        active={category}
        onSelect={setCategory}
        hasProgress={hasProgress}
        hiddenCount={hidden.size}
        onRestoreHidden={hidden.clear}
      />

      <div className="main-column">
        {plrState.status === "ready" ? (
          <>
            <div className="sub-header">
              <button type="button" className="mobile-filter-btn" onClick={() => setDrawerOpen(true)}>
                ☰ {category === ALL_ITEMS ? "FILTER" : category.toUpperCase()}
              </button>
              <div className="search-wrap">
                <span className="search-wrap__slash" aria-hidden="true">
                  /
                </span>
                <input
                  className="search-input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${TOTAL_RESEARCHABLE_ITEMS.toLocaleString()} items…`}
                  aria-label="Search items"
                />
              </div>
              <span className="shown-label">{items.length.toLocaleString()} shown</span>

              <div className="overall-progress">
                <div className="overall-progress__figures">
                  <span className="big-pct">{overall.pct}%</span>
                  <span className="small-label">
                    {overall.done.toLocaleString()} / {overall.total.toLocaleString()} RESEARCHED
                  </span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${overall.pct}%` }} />
                </div>
              </div>
            </div>

            <ItemList
              items={items}
              researchState={researchState}
              manualOverrides={manual.ids}
              onToggleManual={manual.toggle}
              hiddenIds={hidden.ids}
              onToggleHide={hidden.toggle}
              onInfo={setInfoItem}
            />
          </>
        ) : (
          <div className="center-stage">
            {plrState.status === "loading" && (
              <div className="drop-zone">
                <div className="drop-zone__tile" aria-hidden="true">
                  <span className="drop-zone__tile-text">.PLR</span>
                </div>
                <span className="drop-zone__title" role="status">
                  Reading {plrState.fileName}…
                </span>
              </div>
            )}

            {plrState.status === "error" && <StatusBanner kind="error" title="COULDN'T READ THAT FILE" message={plrState.message} />}

            {plrState.status === "not-journey" && (
              <StatusBanner kind="not-journey" title={`${plrState.header.name.toUpperCase()} ISN'T A JOURNEY CHARACTER`} message={plrState.message} />
            )}

            {plrState.status === "idle" && (
              <>
                <DropZone onFile={onLoadFile} busy={false} />
                <span className="path-hint">%USERPROFILE%\Documents\My Games\Terraria\Players</span>
              </>
            )}

            {(plrState.status === "error" || plrState.status === "not-journey") && (
              <DropZone onFile={onLoadFile} busy={false} />
            )}
          </div>
        )}
      </div>

      <MobileCategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        overall={overall}
        categories={categories}
        active={category}
        onSelect={setCategory}
        hasProgress={hasProgress}
      />

      {infoEntry && (
        <ItemInfoModal item={infoEntry} state={researchState?.[infoEntry.internalName]} onClose={() => setInfoItem(null)} />
      )}
    </div>
  );
}
