import { useRef, useState, type DragEvent } from "react";

interface Props {
  onFile: (file: File) => void;
  busy: boolean;
}

export function DropZone({ onFile, busy }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      className="drop-zone"
      data-active={dragActive}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={handleDrop}
    >
      <div className="drop-zone__tile" aria-hidden="true">
        <span className="drop-zone__tile-text">.PLR</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <span className="drop-zone__title">{busy ? "Reading your save…" : "Drop your player.plr"}</span>
        <span className="drop-zone__body">
          …to see what's left to research. Nothing leaves this page — the file is read locally, decrypted in your
          browser, and never uploaded.
        </span>
      </div>
      <div className="drop-zone__actions">
        <button type="button" className="btn-primary-lg" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "READING…" : "CHOOSE FILE"}
        </button>
        <input
          ref={inputRef}
          className="visually-hidden-input"
          type="file"
          accept=".plr"
          tabIndex={-1}
          aria-hidden="true"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
