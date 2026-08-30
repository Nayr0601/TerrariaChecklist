import { useState } from "react";
import { getSpriteUrl } from "../data/sprites";

function tagFor(name: string): string {
  const letters = name.replace(/[^A-Za-z]/g, "");
  return (letters.slice(0, 2) || "??").toUpperCase();
}

interface Props {
  itemId: number;
  displayName: string;
  /** Whether to reveal the sprite/name — unresearched items show a "??" silhouette in-game. */
  revealed: boolean;
  size?: number;
}

/** An inventory-slot-styled tile. Renders the bundled sprite for this item
 * ID when one exists (see data/sprites.ts), otherwise falls back to a
 * pixel-font initials tag — matching the Claude Design reference's
 * placeholder treatment for slots with no art. */
export function ItemTile({ itemId, displayName, revealed, size = 42 }: Props) {
  const spriteUrl = getSpriteUrl(itemId);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="item-tile" style={{ width: size, height: size }} aria-hidden="true">
      {spriteUrl && !imgFailed ? (
        <img src={spriteUrl} alt="" loading="lazy" onError={() => setImgFailed(true)} />
      ) : (
        <span className="item-tile__tag">{revealed ? tagFor(displayName) : "??"}</span>
      )}
    </div>
  );
}
