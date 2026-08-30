import { describe, it, expect } from "vitest";
import { parsePlrFile } from "../../src/parser/plrParser";
import { resolveResearchState } from "../../src/parser/resolveResearch";
import { itemCatalog, itemCatalogList } from "../../src/data/itemCatalog";
import { loadFixture } from "../fixtureUtil";

describe("parsePlrFile — all-research-unlocked 1.4.5 fixture", () => {
  it("decrypts, locates the research block, and resolves ~all researchable items as complete", async () => {
    const buffer = loadFixture("all-researched-1.4.5.plr");
    const result = await parsePlrFile(buffer);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.header.name).toBe("Completionist");
    expect(result.header.version).toBe(279);
    expect(result.research.length).toBe(itemCatalogList.length);

    const state = resolveResearchState(result.research, itemCatalog);
    const complete = Object.values(state).filter((s) => s.status === "complete");
    const incomplete = Object.values(state).filter((s) => s.status !== "complete");

    expect(complete.length).toBe(itemCatalogList.length);
    expect(incomplete.length).toBe(0);
  });
});

describe("parsePlrFile — partial research (1.4.4-shaped header)", () => {
  it("distinguishes complete, partial, and missing items and exercises a second header-version path", async () => {
    const buffer = loadFixture("partial-research-1.4.4.plr");
    const result = await parsePlrFile(buffer);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.header.name).toBe("WorkInProgress");
    expect(result.header.version).toBe(230); // distinct from the 1.4.5 fixture's 279

    const state = resolveResearchState(result.research, itemCatalog);
    const statuses = Object.values(state).map((s) => s.status);

    expect(statuses).toContain("complete");
    expect(statuses).toContain("partial");
    expect(statuses).toContain("missing");

    // Every 3rd catalog item (index % 3 === 2) was never written as a
    // record at all — confirms "no record => zero sacrificed" (brief §11).
    const neverRecorded = itemCatalogList.filter((_, i) => i % 3 === 2);
    for (const item of neverRecorded) {
      expect(state[item.internalName].sacrificed).toBe(0);
      expect(state[item.internalName].status).toBe("missing");
    }
  });
});

describe("parsePlrFile — non-Journey character", () => {
  it("reports a clear non-Journey result instead of a fabricated 0% research state", async () => {
    const buffer = loadFixture("non-journey.plr");
    const result = await parsePlrFile(buffer);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.kind).toBe("not-journey");
    if (result.kind !== "not-journey") return;
    expect(result.header.name).toBe("ClassicHero");
    expect(result.message.toLowerCase()).toContain("journey");
  });
});

describe("parsePlrFile — corrupt / invalid file", () => {
  it("reports a corrupt-file error without throwing", async () => {
    const buffer = loadFixture("corrupt.plr");
    const result = await parsePlrFile(buffer);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.kind).toBe("corrupt");
  });

  it("handles a zero-length buffer without throwing", async () => {
    const result = await parsePlrFile(new ArrayBuffer(0));
    expect(result.ok).toBe(false);
  });

  it("handles a buffer whose length isn't a multiple of the AES block size", async () => {
    const result = await parsePlrFile(new ArrayBuffer(17));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.kind).toBe("corrupt");
  });
});
