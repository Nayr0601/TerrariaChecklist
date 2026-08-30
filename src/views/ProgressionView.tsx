import { PROGRESSION_SECTIONS } from "../data/progression";
import { usePersistentSet } from "../hooks/usePersistentSet";
import { ProgressionSectionView } from "../components/ProgressionSectionView";

/**
 * Bosses / events / NPCs checklist. Entirely independent of any `.plr`
 * upload — state lives in localStorage (see usePersistentSet) and survives
 * reloads, but is never derived from or coupled to Journey research state.
 */
export function ProgressionView() {
  const { ids: completed, toggle } = usePersistentSet("journey-ledger:progression");

  return (
    <div className="progression-body">
      {PROGRESSION_SECTIONS.map((section) => (
        <ProgressionSectionView key={section.id} section={section} completed={completed} onToggle={toggle} />
      ))}
    </div>
  );
}
