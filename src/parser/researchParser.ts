import { isValidInternalNameRange, asciiSlice } from "./binary";
import type { ResearchRecord } from "./types";

const MIN_NAME_LEN = 1;
const MAX_NAME_LEN = 50; // longest internal item names run ~30-40 chars; 50 gives headroom
const MAX_STACK = 999_999; // sacrificed counts are always small (largest `needed` is a few hundred)
const MAX_PLAUSIBLE_RECORD_COUNT = 10_000; // catalog is ~6.1k items; headroom for future patches

export interface ResearchBlock {
  /** Byte offset of the int32 record-count field. */
  offset: number;
  count: number;
  records: ResearchRecord[];
  /** Byte offset immediately after the last record (start of any trailing data). */
  end: number;
}

/**
 * Locates and parses the Journey-mode research block inside a decrypted
 * player save.
 *
 * The block's exact byte offset is genuinely version-dependent: it sits
 * after a long, format-version-specific run of other player fields
 * (difficulty, appearance, loadouts, etc.), and is itself followed by more
 * trailing per-version flag data (brief §11) — so there is no single fixed
 * offset that works across releases.
 *
 * Instead of hand-modeling every version's preceding field layout, this
 * scans forward for an int32 that is immediately followed by exactly that
 * many well-formed `[nameLen:u8][name:ascii][sacrificed:i32]` records in a
 * row. A record is only accepted if its name is a plausible-length
 * alphanumeric string and its count is a plausible-small integer, so
 * self-consistent runs at the *wrong* offset are essentially impossible
 * (Terraria internal item names are alphanumeric plus underscore — see
 * `pre-data/Terraria Items - Sheet1.csv`). When more than one offset
 * validates, the run with the largest record count wins, which is always
 * the real research block rather than an incidental match in filler bytes.
 */
export function parseResearchBlock(bytes: Uint8Array, view: DataView, searchFrom = 0): ResearchBlock | null {
  const n = bytes.length;

  function tryRecord(i: number): { record: ResearchRecord; next: number } | null {
    if (i + 1 > n) return null;
    const nameLen = bytes[i];
    if (nameLen < MIN_NAME_LEN || nameLen > MAX_NAME_LEN) return null;
    if (i + 1 + nameLen + 4 > n) return null;
    if (!isValidInternalNameRange(bytes, i + 1, i + 1 + nameLen)) return null;
    const sacrificed = view.getInt32(i + 1 + nameLen, true);
    if (sacrificed < 0 || sacrificed > MAX_STACK) return null;
    const internalName = asciiSlice(bytes, i + 1, i + 1 + nameLen);
    return { record: { internalName, sacrificed }, next: i + 1 + nameLen + 4 };
  }

  let best: ResearchBlock | null = null;

  for (let offset = searchFrom; offset + 4 < n; offset++) {
    const count = view.getInt32(offset, true);
    if (count < 1 || count > MAX_PLAUSIBLE_RECORD_COUNT) continue;
    if (best && count <= best.count) continue; // only bother beating the current best

    let cursor = offset + 4;
    const records: ResearchRecord[] = [];
    let ok = true;
    for (let k = 0; k < count; k++) {
      const r = tryRecord(cursor);
      if (!r) {
        ok = false;
        break;
      }
      records.push(r.record);
      cursor = r.next;
    }

    if (ok) {
      best = { offset, count, records, end: cursor };
    }
  }

  return best;
}
