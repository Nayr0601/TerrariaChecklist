import { useMemo } from "react";
import { FixedSizeList, type ListChildComponentProps } from "react-window";
import type { GeneratedItem } from "../data/itemCatalog";
import type { ItemResearchState } from "../parser/types";
import { ItemRow } from "./ItemRow";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useElementSize } from "../hooks/useElementSize";

interface RowData {
  items: GeneratedItem[];
  researchState: Record<string, ItemResearchState> | null;
  manualOverrides: Set<string>;
  onToggleManual: (internalName: string) => void;
  hiddenIds: Set<string>;
  onToggleHide: (internalName: string) => void;
  onInfo: (internalName: string) => void;
  showItemNames: boolean;
}

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  const item = data.items[index];
  return (
    <div style={style}>
      <ItemRow
        item={item}
        state={data.researchState?.[item.internalName]}
        manuallyMarked={data.manualOverrides.has(item.internalName)}
        onToggleManual={data.onToggleManual}
        ignored={data.hiddenIds.has(item.internalName)}
        onToggleHide={data.onToggleHide}
        onInfo={data.onInfo}
        showItemNames={data.showItemNames}
      />
    </div>
  );
}

interface Props {
  items: GeneratedItem[];
  researchState: Record<string, ItemResearchState> | null;
  manualOverrides: Set<string>;
  onToggleManual: (internalName: string) => void;
  hiddenIds: Set<string>;
  onToggleHide: (internalName: string) => void;
  onInfo: (internalName: string) => void;
  showItemNames: boolean;
}

/**
 * Virtualized item list (react-window) — with ~6,133 researchable items,
 * mounting every row's DOM at once is the difference between an instant
 * "All Items" view and a multi-second layout stall, especially once
 * sprite `<img>` tags are involved.
 */
export function ItemList({
  items,
  researchState,
  manualOverrides,
  onToggleManual,
  hiddenIds,
  onToggleHide,
  onInfo,
  showItemNames,
}: Props) {
  const isMobile = useMediaQuery("(max-width: 780px)");
  const rowHeight = isMobile ? 110 : 70;
  const { ref, width, height } = useElementSize<HTMLDivElement>();

  const itemData = useMemo<RowData>(
    () => ({ items, researchState, manualOverrides, onToggleManual, hiddenIds, onToggleHide, onInfo, showItemNames }),
    [items, researchState, manualOverrides, onToggleManual, hiddenIds, onToggleHide, onInfo, showItemNames],
  );

  return (
    <div className="item-list" role="list" aria-label="Items" ref={ref}>
      {items.length === 0 ? (
        <p style={{ padding: "24px 8px", color: "var(--dim)" }}>No items match your search and filters.</p>
      ) : width > 0 && height > 0 ? (
        <FixedSizeList
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={rowHeight}
          itemData={itemData}
          overscanCount={8}
        >
          {Row}
        </FixedSizeList>
      ) : null}
    </div>
  );
}
