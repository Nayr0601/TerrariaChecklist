import { decryptPlr, PlrDecryptError } from "./crypto";
import { parsePlayerHeader } from "./playerHeader";
import { parseResearchBlock } from "./researchParser";
import type { ParsedPlrResult } from "./types";

/**
 * Parses a raw `.plr` file (already read into memory, e.g. via
 * `File#arrayBuffer()`) entirely client-side: AES-128-CBC decrypt, then
 * locate and decode the Journey-mode research block.
 *
 * Never throws — every failure mode (corrupt file, wrong key/format,
 * valid-but-non-Journey character) is reported through the returned
 * discriminated union so the UI can render a clear message instead of
 * crashing. See `types.ts` for the result shape.
 */
export async function parsePlrFile(buffer: ArrayBuffer): Promise<ParsedPlrResult> {
  let plaintext: Uint8Array;
  try {
    plaintext = await decryptPlr(buffer);
  } catch (err) {
    return { ok: false, kind: "corrupt", message: messageOf(err) };
  }

  const view = new DataView(plaintext.buffer, plaintext.byteOffset, plaintext.byteLength);
  const header = parsePlayerHeader(plaintext, view);

  if (!header.magicValid) {
    return {
      ok: false,
      kind: "corrupt",
      message:
        "This file decrypted, but doesn't look like a Terraria player save (missing the expected file signature). It may be corrupt, from an unsupported game, or not a .plr file at all.",
    };
  }

  const research = parseResearchBlock(plaintext, view, header.afterName);

  if (!research || research.records.length === 0) {
    return {
      ok: false,
      kind: "not-journey",
      header: { version: header.version, name: header.name || "(unnamed character)" },
      message:
        "This is a valid Terraria character, but it isn't a Journey Mode character. Only Journey Mode saves contain research data — Classic, Mediumcore, and Hardcore characters never do.",
    };
  }

  return {
    ok: true,
    header: { version: header.version, name: header.name || "(unnamed character)" },
    research: research.records,
  };
}

function messageOf(err: unknown): string {
  if (err instanceof PlrDecryptError) return err.message;
  if (err instanceof Error) return err.message;
  return "Unknown error while reading the file.";
}
