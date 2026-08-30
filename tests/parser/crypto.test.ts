import { describe, it, expect } from "vitest";
import { createCipheriv } from "node:crypto";
import { decryptPlr, PlrDecryptError, PLR_KEY_BYTES } from "../../src/parser/crypto";

function encryptWithRealKey(plaintext: Buffer): ArrayBuffer {
  const key = Buffer.from(PLR_KEY_BYTES);
  const cipher = createCipheriv("aes-128-cbc", key, key);
  const out = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
}

describe("decryptPlr", () => {
  it("derives a 16-byte key from the UTF-16LE bytes of h3y_gUyZ", () => {
    expect(PLR_KEY_BYTES.length).toBe(16);
    // 'h' = 0x68, 'y' = 0x79, ... each ASCII char followed by a 0x00 high byte
    expect(Array.from(PLR_KEY_BYTES.slice(0, 4))).toEqual([0x68, 0x00, 0x33, 0x00]);
  });

  it("round-trips arbitrary plaintext encrypted with the real Terraria key/IV", async () => {
    const plaintext = Buffer.from("hello terraria research block".padEnd(32, "\0"), "utf-8");
    const ciphertext = encryptWithRealKey(plaintext);
    const result = await decryptPlr(ciphertext);
    expect(Buffer.from(result).toString("utf-8")).toBe(plaintext.toString("utf-8"));
  });

  it("rejects an empty buffer", async () => {
    await expect(decryptPlr(new ArrayBuffer(0))).rejects.toThrow(PlrDecryptError);
  });

  it("rejects a buffer whose length isn't a multiple of 16", async () => {
    await expect(decryptPlr(new ArrayBuffer(15))).rejects.toThrow(PlrDecryptError);
  });

  it("rejects block-aligned bytes that aren't valid PKCS#7-padded ciphertext under this key", async () => {
    // Fixed (non-random) bytes so this is fully deterministic: uniform
    // 0xAB repeated for 4 blocks does not decrypt to valid PKCS#7 padding
    // under the real key.
    const junk = new Uint8Array(64).fill(0xab);
    await expect(decryptPlr(junk.buffer)).rejects.toThrow(PlrDecryptError);
  });
});
