/** A single Journey-mode research record read out of a decrypted .plr file. */
export interface ResearchRecord {
  /** Internal item name, e.g. "IronPickaxe". */
  internalName: string;
  /** Number of copies sacrificed to the Research bin. */
  sacrificed: number;
}

/** The player-save header fields the tracker actually needs. */
export interface PlayerHeader {
  /** Raw save format version (int32, little-endian) from the file. */
  version: number;
  /** Character name, if it could be decoded. */
  name: string;
}

export type ParsedPlrResult =
  | { ok: true; header: PlayerHeader; research: ResearchRecord[] }
  | { ok: false; kind: "corrupt"; message: string }
  | { ok: false; kind: "not-journey"; message: string; header: PlayerHeader };

/** Per-item research status once resolved against the item catalog. */
export type ResearchStatus = "missing" | "partial" | "complete";

export interface ItemResearchState {
  sacrificed: number;
  needed: number;
  status: ResearchStatus;
}
