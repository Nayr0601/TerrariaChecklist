import type { CategoryStat } from "../hooks/useCategoryStats";
import { CategoryList } from "./CategoryList";

interface Props {
  overall: CategoryStat;
  categories: CategoryStat[];
  active: string;
  onSelect: (name: string) => void;
  hasProgress: boolean;
  hiddenCount: number;
  onRestoreHidden: () => void;
}

export function Sidebar({ overall, categories, active, onSelect, hasProgress, hiddenCount, onRestoreHidden }: Props) {
  return (
    <aside className="sidebar" aria-label="Item categories">
      <div className="sidebar__title">CATEGORIES</div>
      <CategoryList overall={overall} categories={categories} active={active} onSelect={onSelect} hasProgress={hasProgress} />

      <div className="sidebar__hidden-panel" data-disabled={!hasProgress && hiddenCount === 0}>
        <span className="hidden-label">HIDDEN ITEMS</span>
        <span className="hidden-count">{hiddenCount} hidden</span>
        <button type="button" className="link-btn" onClick={onRestoreHidden} disabled={hiddenCount === 0}>
          restore all
        </button>
      </div>
    </aside>
  );
}
