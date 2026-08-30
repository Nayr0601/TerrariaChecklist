import type { CategoryStat } from "../hooks/useCategoryStats";

interface Props {
  overall: CategoryStat;
  categories: CategoryStat[];
  active: string;
  onSelect: (name: string) => void;
  /** Whether there's any real progress to show a percentage for (a loaded
   * save, or at least one manual override) — otherwise every row shows "—". */
  hasProgress: boolean;
}

export function CategoryList({ overall, categories, active, onSelect, hasProgress }: Props) {
  const all = [overall, ...categories];
  return (
    <div className="sidebar__categories" aria-label="Item categories">
      {all.map((c) => (
        <button
          key={c.name}
          type="button"
          aria-current={active === c.name}
          className="category-btn"
          onClick={() => onSelect(c.name)}
        >
          <span className="category-btn__fill" style={{ width: `${hasProgress ? c.pct : 0}%` }} />
          <span className="category-btn__name">{c.name}</span>
          <span className="category-btn__pct">{hasProgress ? `${c.pct}%` : "—"}</span>
        </button>
      ))}
    </div>
  );
}
