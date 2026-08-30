import { read7BitLengthString, asciiSlice } from "./binary";

const MAGIC = "relogic";
const MAGIC_OFFSET = 4;
/** version(4) + "relogic"(7) + fileType(1) + revision(4) + favorited(8) */
const NAME_OFFSET = 24;

export interface ParsedPlayerHeader {
  version: number;
  magicValid: boolean;
  name: string;
  /** Byte offset immediately after the name field — where further
   * version-specific player fields would begin. */
  afterName: number;
}

/**
 * Reads the fixed-layout portion of a decrypted `.plr` file: the format
 * version, the "relogic" magic bytes, and the length-prefixed character
 * name. This layout has been stable across the 1.4.x range (see brief
 * §10/§11), so it is read unconditionally — `version` is returned so
 * callers can branch on it for anything that *does* vary by release.
 */
export function parsePlayerHeader(bytes: Uint8Array, view: DataView): ParsedPlayerHeader {
  if (bytes.length < NAME_OFFSET + 1) {
    return { version: 0, magicValid: false, name: "", afterName: bytes.length };
  }

  const version = view.getInt32(0, true);
  const magicValid = asciiSlice(bytes, MAGIC_OFFSET, MAGIC_OFFSET + MAGIC.length) === MAGIC;

  let name = "";
  let afterName = NAME_OFFSET;
  try {
    const result = read7BitLengthString(bytes, NAME_OFFSET);
    name = result.value;
    afterName = result.next;
  } catch {
    // Leave name blank; magicValid is what actually gates "is this a
    // Terraria save" downstream.
  }

  return { version, magicValid, name, afterName };
}
