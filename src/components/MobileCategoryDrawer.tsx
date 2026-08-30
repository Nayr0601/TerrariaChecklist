import { useEffect, useRef } from "react";
import type { CategoryStat } from "../hooks/useCategoryStats";

interface Props {
  open: boolean;
  onClose: () => void;
  overall: CategoryStat;
  categories: CategoryStat[];
  active: string;
  onSelect: (name: string) => void;
  hasProgress: boolean;
}

export function MobileCategoryDrawer({ open, onClose, overall, categories, active, onSelect, hasProgress }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const all = [overall, ...categories];

  return (
    <div className="sidebar-drawer-scrim" onClick={onClose}>
      <div
        className="sidebar-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Categories"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sidebar-drawer__head">
          <span className="sidebar-drawer__title">CATEGORIES</span>
          <button ref={closeRef} type="button" className="sidebar-drawer__close" onClick={onClose} aria-label="Close categories">
            ×
          </button>
        </div>
        <div className="sidebar-drawer__grid" aria-label="Item categories">
          {all.map((c) => (
            <button
              key={c.name}
              type="button"
              aria-current={active === c.name}
              className="category-btn"
              onClick={() => {
                onSelect(c.name);
                onClose();
              }}
            >
              <span className="category-btn__fill" style={{ width: `${hasProgress ? c.pct : 0}%` }} />
              <span className="category-btn__name">{c.name}</span>
              <span className="category-btn__pct">{hasProgress ? `${c.pct}%` : "—"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
