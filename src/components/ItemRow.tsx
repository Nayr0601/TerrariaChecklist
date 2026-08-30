import { memo } from "react";
import type { GeneratedItem } from "../data/itemCatalog";
import type { ItemResearchState, ResearchStatus } from "../parser/types";
import { wikiUrlForItem } from "../data/wiki";
import { ItemTile } from "./ItemTile";

interface Props {
  item: GeneratedItem;
  state: ItemResearchState | undefined;
  manuallyMarked: boolean;
  onToggleManual: (internalName: string) => void;
  ignored: boolean;
  onToggleHide: (internalName: string) => void;
  onInfo: (internalName: string) => void;
  /** When on, names/art are always shown regardless of research status —
   * see `SettingsMenu`'s "Show Item Names" switch. */
  showItemNames: boolean;
}

function stateLabel(status: ResearchStatus, sacrificed: number, needed: number): string {
  if (status === "complete") return "RESEARCHED";
  if (status === "partial") return `PARTIAL · ${sacrificed}/${needed}`;
  return `MISSING · ${sacrificed}/${needed}`;
}

export const ItemRow = memo(function ItemRow({
  item,
  state,
  manuallyMarked,
  onToggleManual,
  ignored,
  onToggleHide,
  onInfo,
  showItemNames,
}: Props) {
  const sacrificed = state?.sacrificed ?? 0;
  const needed = state?.needed ?? item.needed;
  const savedStatus: ResearchStatus = state?.status ?? "missing";
  const effectiveStatus: ResearchStatus = savedStatus === "complete" ? "complete" : manuallyMarked ? "complete" : savedStatus;
  const revealed = showItemNames || effectiveStatus !== "missing";

  return (
    <div className="item-row" data-status={effectiveStatus} data-ignored={ignored} role="listitem">
      <ItemTile itemId={item.id} displayName={item.displayName} revealed={revealed} />

      <div className="item-info">
        <span className="item-name">{revealed ? item.displayName : "?????"}</span>
        <span className="item-meta">
          #{item.id} · {item.category}
          {ignored && <span className="item-ignored-flag"> · IGNORED</span>}
        </span>
      </div>

      <div className="item-state" data-status={effectiveStatus}>
        {savedStatus === "complete"
          ? "RESEARCHED"
          : manuallyMarked
            ? "MARKED · MANUAL"
            : stateLabel(savedStatus, sacrificed, needed)}
      </div>

      <div className="item-actions">
        <button
          type="button"
          className="icon-btn"
          aria-pressed={effectiveStatus === "complete"}
          disabled={savedStatus === "complete"}
          title={savedStatus === "complete" ? "Already researched in your save" : "Mark researched (manual, local only)"}
          aria-label={`Mark ${item.displayName} as researched (manual tracking, doesn't edit your save)`}
          onClick={() => onToggleManual(item.internalName)}
        >
          ✓
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-pressed={ignored}
          title={ignored ? "Restore item" : "Hide item"}
          aria-label={ignored ? `Restore ${item.displayName} to the list` : `Hide ${item.displayName} from the list`}
          onClick={() => onToggleHide(item.internalName)}
        >
          {ignored ? "↺" : "⊘"}
        </button>
        <button
          type="button"
          className="icon-btn-mono"
          title="Item info"
          aria-label={`Show details for ${item.displayName}`}
          onClick={() => onInfo(item.internalName)}
        >
          i
        </button>
        <a
          className="icon-link"
          href={wikiUrlForItem(item.displayName)}
          target="_blank"
          rel="noopener noreferrer"
          title="Open wiki"
          aria-label={`Open the wiki page for ${item.displayName} in a new tab`}
        >
          ↗
        </a>
      </div>
    </div>
  );
});
