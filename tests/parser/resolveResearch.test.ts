import { describe, it, expect } from "vitest";
import { resolveResearchState } from "../../src/parser/resolveResearch";
import type { GeneratedItem } from "../../src/data/itemCatalog";

const catalog: Record<string, GeneratedItem> = {
  IronPickaxe: { id: 1, displayName: "Iron Pickaxe", internalName: "IronPickaxe", needed: 1, category: "Tools" },
  DirtBlock: { id: 2, displayName: "Dirt Block", internalName: "DirtBlock", needed: 100, category: "Blocks & Walls" },
  Torch: { id: 8, displayName: "Torch", internalName: "Torch", needed: 100, category: "Misc" },
};

describe("resolveResearchState", () => {
  it("marks an item complete when sacrificed >= needed", () => {
    const state = resolveResearchState([{ internalName: "IronPickaxe", sacrificed: 1 }], catalog);
    expect(state.IronPickaxe).toEqual({ sacrificed: 1, needed: 1, status: "complete" });
  });

  it("marks an item partial when 0 < sacrificed < needed", () => {
    const state = resolveResearchState([{ internalName: "DirtBlock", sacrificed: 40 }], catalog);
    expect(state.DirtBlock).toEqual({ sacrificed: 40, needed: 100, status: "partial" });
  });

  it("treats an item with no record as zero sacrificed / missing", () => {
    const state = resolveResearchState([{ internalName: "IronPickaxe", sacrificed: 1 }], catalog);
    expect(state.Torch).toEqual({ sacrificed: 0, needed: 100, status: "missing" });
  });

  it("treats an over-sacrificed count as complete, not an error", () => {
    const state = resolveResearchState([{ internalName: "Torch", sacrificed: 250 }], catalog);
    expect(state.Torch.status).toBe("complete");
  });

  it("ignores research records for internal names not in the catalog", () => {
    const state = resolveResearchState([{ internalName: "SomeFutureItem", sacrificed: 5 }], catalog);
    expect(Object.keys(state).sort()).toEqual(["DirtBlock", "IronPickaxe", "Torch"]);
  });
});
