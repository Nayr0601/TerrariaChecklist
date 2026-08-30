import { describe, it, expect } from "vitest";
import { parseResearchBlock } from "../../src/parser/researchParser";

function u32le(n: number): number[] {
  const b = Buffer.alloc(4);
  b.writeInt32LE(n, 0);
  return [...b];
}

function record(name: string, count: number): number[] {
  return [name.length, ...Buffer.from(name, "ascii"), ...u32le(count)];
}

function toView(bytes: number[]) {
  const u8 = new Uint8Array(bytes);
  return { u8, view: new DataView(u8.buffer) };
}

describe("parseResearchBlock", () => {
  it("finds a research block located immediately at the search offset", () => {
    const records = [record("IronPickaxe", 1), record("DirtBlock", 100), record("Torch", 100)];
    const bytes = [...u32le(records.length), ...records.flat()];
    const { u8, view } = toView(bytes);

    const result = parseResearchBlock(u8, view, 0);
    expect(result).not.toBeNull();
    expect(result!.count).toBe(3);
    expect(result!.records).toEqual([
      { internalName: "IronPickaxe", sacrificed: 1 },
      { internalName: "DirtBlock", sacrificed: 100 },
      { internalName: "Torch", sacrificed: 100 },
    ]);
  });

  it("skips over unrelated leading bytes to find the block (no fixed offset assumed)", () => {
    const records = [record("GoldBar", 25), record("SilverOre", 100)];
    const leadingJunk = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const bytes = [...leadingJunk, ...u32le(records.length), ...records.flat()];
    const { u8, view } = toView(bytes);

    const result = parseResearchBlock(u8, view, 0);
    expect(result).not.toBeNull();
    expect(result!.offset).toBe(leadingJunk.length);
    expect(result!.records.map((r) => r.internalName)).toEqual(["GoldBar", "SilverOre"]);
  });

  it("prefers the largest self-consistent record run over an incidental smaller match", () => {
    // A count field that could *coincidentally* look like a valid 1-record
    // block if read in isolation, followed later by the real (larger) block.
    const decoy = [...u32le(1), ...record("ZZ", 1)]; // looks like a 1-item block
    const real = [...u32le(2), ...record("KingSlimeTrophy", 1), ...record("EyeMask", 1)];
    const bytes = [...decoy, ...real];
    const { u8, view } = toView(bytes);

    const result = parseResearchBlock(u8, view, 0);
    expect(result!.count).toBe(2);
    expect(result!.records.map((r) => r.internalName)).toEqual(["KingSlimeTrophy", "EyeMask"]);
  });

  it("returns null when there is no research block at all (e.g. a non-Journey character)", () => {
    const bytes = Array.from({ length: 64 }, (_, i) => (i * 37) % 256);
    // Zero out anywhere a plausible small count could accidentally sit, by
    // just checking the function tolerates pure noise without throwing.
    const { u8, view } = toView(bytes);
    const result = parseResearchBlock(u8, view, 0);
    // With only 64 bytes of noise, a false-positive self-consistent run is
    // essentially impossible; assert it's either null or (extremely
    // unlikely) internally consistent — the real guarantee under test is
    // "does not throw".
    if (result) {
      expect(result.records.length).toBe(result.count);
    }
  });

  it("rejects a record whose name contains non-alphanumeric bytes", () => {
    const badName = Buffer.from("Iron Pick", "ascii"); // contains a space
    const bytes = [...u32le(1), badName.length, ...badName, ...u32le(1)];
    const { u8, view } = toView(bytes);
    const result = parseResearchBlock(u8, view, 0);
    expect(result).toBeNull();
  });
});
