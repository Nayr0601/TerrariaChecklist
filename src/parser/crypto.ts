/**
 * Terraria encrypts `.plr` files with AES-128-CBC using a hardcoded
 * passphrase as both the key and the IV: the UTF-16LE bytes of "h3y_gUyZ"
 * (8 characters x 2 bytes = 16 bytes, i.e. exactly one AES block).
 *
 * Decryption happens entirely with the browser's Web Crypto API
 * (`crypto.subtle`) — no Node/server-side crypto dependency, and the file
 * bytes never leave the machine.
 */

const PASSPHRASE = "h3y_gUyZ";

// Explicit `<ArrayBuffer>` generics below work around TS 5.7+ defaulting a
// bare `Uint8Array` annotation to `Uint8Array<ArrayBufferLike>`, which is
// NOT assignable to DOM's `BufferSource` (typed against plain
// `ArrayBuffer`) — these arrays are always backed by a fresh ArrayBuffer,
// so the annotation is just narrowing TS back to the truth.
function utf16LeBytes(s: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(s.length * 2);
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    out[i * 2] = code & 0xff;
    out[i * 2 + 1] = (code >> 8) & 0xff;
  }
  return out;
}

export const PLR_KEY_BYTES = utf16LeBytes(PASSPHRASE);

export class PlrDecryptError extends Error {}

/**
 * Decrypts a raw `.plr` file's bytes and strips PKCS#7 padding.
 * Throws {@link PlrDecryptError} if the buffer isn't a valid AES-CBC
 * ciphertext under the Terraria key (e.g. not a Terraria save at all).
 */
export async function decryptPlr(buffer: ArrayBuffer): Promise<Uint8Array<ArrayBuffer>> {
  if (buffer.byteLength === 0) {
    throw new PlrDecryptError("The file is empty.");
  }
  if (buffer.byteLength % 16 !== 0) {
    throw new PlrDecryptError(
      "This doesn't look like a Terraria .plr file (its length isn't a multiple of the AES block size).",
    );
  }

  const key = await crypto.subtle.importKey("raw", PLR_KEY_BYTES, { name: "AES-CBC" }, false, ["decrypt"]);

  let plaintext: ArrayBuffer;
  try {
    // Note: WebCrypto's "AES-CBC" mode already validates and strips PKCS#7
    // padding as part of `decrypt()` (it throws OperationError on invalid
    // padding) — that's what satisfies the "strip PKCS#7 padding after
    // decryption" requirement here. Stripping it a second time would
    // corrupt the final bytes of legitimate plaintext.
    plaintext = await crypto.subtle.decrypt({ name: "AES-CBC", iv: PLR_KEY_BYTES }, key, buffer);
  } catch {
    throw new PlrDecryptError("Decryption failed. This file doesn't appear to be a Terraria player save.");
  }

  return new Uint8Array(plaintext);
}
