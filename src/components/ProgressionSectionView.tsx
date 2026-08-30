import type { ProgressionSection } from "../data/progression";
import { percent } from "../utils/percent";
import { ProgressionTile } from "./ProgressionTile";

interface Props {
  section: ProgressionSection;
  completed: Set<string>;
  onToggle: (id: string) => void;
}

export function ProgressionSectionView({ section, completed, onToggle }: Props) {
  const done = section.entries.filter((e) => completed.has(e.id)).length;
  const pct = percent(done, section.entries.length);

  return (
    <section className="progression-section" aria-labelledby={`section-${section.id}`}>
      <div className="section-head">
        <span className="section-title" id={`section-${section.id}`}>
          {section.title.toUpperCase()}
        </span>
        <div className="section-bar-track">
          <div className="section-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="section-count">
          {done} / {section.entries.length}
        </span>
        <span className="section-pct">{pct}%</span>
      </div>
      <div className="progression-grid">
        {section.entries.map((entry) => (
          <ProgressionTile key={entry.id} entry={entry} verb={section.verb} done={completed.has(entry.id)} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}
