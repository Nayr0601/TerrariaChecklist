/** Reads a 7-bit-encoded (.NET `BinaryWriter.Write(string)`) length-prefixed
 * ASCII/Latin1 string starting at byte offset `i`. */
export function read7BitLengthString(bytes: Uint8Array, i: number): { value: string; next: number } {
  let length = 0;
  let shift = 0;
  let pos = i;
  // The length itself is 7-bit encoded: each byte contributes 7 bits, MSB
  // set means "more bytes follow". Player name strings are short so this
  // loop runs once or twice in practice.
  while (true) {
    if (pos >= bytes.length) throw new RangeError("Unexpected end of buffer while reading string length");
    const b = bytes[pos++];
    length |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) break;
    shift += 7;
  }
  if (pos + length > bytes.length) throw new RangeError("Unexpected end of buffer while reading string body");
  let value = "";
  for (let k = 0; k < length; k++) value += String.fromCharCode(bytes[pos + k]);
  return { value, next: pos + length };
}

/** True if every byte in `bytes[start, end)` is an ASCII letter, digit, or
 * underscore — the full character set used across every internal item name
 * in `pre-data/Terraria Items - Sheet1.csv` (a small number of items, e.g.
 * the wire logic gates and "fake chest" traps, use an underscore). */
export function isValidInternalNameRange(bytes: Uint8Array, start: number, end: number): boolean {
  for (let i = start; i < end; i++) {
    const c = bytes[i];
    const isDigit = c >= 48 && c <= 57;
    const isUpper = c >= 65 && c <= 90;
    const isLower = c >= 97 && c <= 122;
    const isUnderscore = c === 95;
    if (!isDigit && !isUpper && !isLower && !isUnderscore) return false;
  }
  return true;
}

export function asciiSlice(bytes: Uint8Array, start: number, end: number): string {
  let s = "";
  for (let i = start; i < end; i++) s += String.fromCharCode(bytes[i]);
  return s;
}
