import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const FIXTURE_DIR = resolve(__dirname, "fixtures");

/** Loads a generated test fixture as an ArrayBuffer, the same shape
 * `File#arrayBuffer()` produces in the browser. */
export function loadFixture(name: string): ArrayBuffer {
  const buf = readFileSync(resolve(FIXTURE_DIR, name));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}
