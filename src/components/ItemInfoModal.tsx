import { useEffect, useRef } from "react";
import type { GeneratedItem } from "../data/itemCatalog";
import type { ItemResearchState } from "../parser/types";
import { wikiUrlForItem } from "../data/wiki";

interface Props {
  item: GeneratedItem;
  state: ItemResearchState | undefined;
  onClose: () => void;
}

export function ItemInfoModal({ item, state, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-info-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          background: "var(--panel)",
          border: "1px solid var(--frame)",
          borderRadius: 4,
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <h2 id="item-info-title" style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--text)", flex: 1 }}>
            {item.displayName}
          </h2>
          <button ref={closeRef} type="button" className="sidebar-drawer__close" style={{ margin: 0 }} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", margin: 0, fontSize: 13 }}>
          <dt style={{ color: "var(--dim)" }}>Item ID</dt>
          <dd style={{ margin: 0, color: "var(--body-text)" }}>#{item.id}</dd>

          <dt style={{ color: "var(--dim)" }}>Internal name</dt>
          <dd style={{ margin: 0, color: "var(--body-text)", fontFamily: "var(--font-mono)" }}>{item.internalName}</dd>

          <dt style={{ color: "var(--dim)" }}>Category</dt>
          <dd style={{ margin: 0, color: "var(--body-text)" }}>{item.category}</dd>

          <dt style={{ color: "var(--dim)" }}>Research required</dt>
          <dd style={{ margin: 0, color: "var(--body-text)" }}>{item.needed}</dd>

          <dt style={{ color: "var(--dim)" }}>Sacrificed</dt>
          <dd style={{ margin: 0, color: "var(--body-text)" }}>{state ? state.sacrificed : "— (no save loaded)"}</dd>

          <dt style={{ color: "var(--dim)" }}>Status</dt>
          <dd style={{ margin: 0, color: "var(--body-text)", textTransform: "capitalize" }}>{state?.status ?? "missing"}</dd>
        </dl>

        <a
          className="btn-secondary"
          style={{ textAlign: "center" }}
          href={wikiUrlForItem(item.displayName)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open wiki page ↗
        </a>
      </div>
    </div>
  );
}
