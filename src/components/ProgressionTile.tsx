import type { ProgressionEntry } from "../data/progression";
import { RARITY_COLORS } from "../data/rarity";
import { getBossSpriteUrl } from "../data/bossSprites";

function tagFor(name: string): string {
  const letters = name.replace(/[^A-Za-z]/g, "");
  return (letters.slice(0, 2) || "??").toUpperCase();
}

interface Props {
  entry: ProgressionEntry;
  verb: string;
  done: boolean;
  onToggle: (id: string) => void;
}

export function ProgressionTile({ entry, verb, done, onToggle }: Props) {
  const color = RARITY_COLORS[entry.tier];
  // Only bosses have art today (see `bossSprites.ts`) — events/NPCs fall
  // back to the initials tag below, same as before this existed.
  const spriteUrl = getBossSpriteUrl(entry.id);

  return (
    <button
      type="button"
      className="progression-tile"
      aria-pressed={done}
      aria-label={`${entry.name}: ${done ? verb.toLowerCase() : "not yet"}. Toggle.`}
      style={{ color: done ? color : undefined }}
      onClick={() => onToggle(entry.id)}
    >
      <div className="progression-tile__slot" aria-hidden="true">
        {spriteUrl ? (
          <img className="progression-tile__sprite" src={spriteUrl} alt="" loading="lazy" data-done={done} />
        ) : (
          <span className="progression-tile__tag" style={{ color: done ? color : undefined }}>
            {done ? tagFor(entry.name) : "??"}
          </span>
        )}
      </div>
      <div className="progression-tile__info">
        <span className="progression-tile__name" style={{ color: done ? color : undefined }}>
          {entry.name}
        </span>
        <span className="progression-tile__stamp">{done ? verb : "NOT YET"}</span>
      </div>
    </button>
  );
}
