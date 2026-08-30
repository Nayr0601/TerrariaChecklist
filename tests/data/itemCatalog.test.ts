import { describe, it, expect } from "vitest";
import { itemCatalog, itemCatalogList, TOTAL_RESEARCHABLE_ITEMS, getItemById } from "../../src/data/itemCatalog";

describe("generated item catalog (items.json)", () => {
  it("contains approximately the expected number of researchable items", () => {
    // Brief: "Only include an item when Research is present AND Research >
    // 0" should yield ~6,133 items from the source CSVs.
    expect(TOTAL_RESEARCHABLE_ITEMS).toBe(6133);
    expect(itemCatalogList.length).toBe(TOTAL_RESEARCHABLE_ITEMS);
  });

  it("keys every entry by its internal name, matching its own internalName field", () => {
    for (const [key, item] of Object.entries(itemCatalog)) {
      expect(item.internalName).toBe(key);
    }
  });

  it("gives every item a positive research requirement", () => {
    for (const item of itemCatalogList) {
      expect(item.needed).toBeGreaterThan(0);
    }
  });

  it("resolves well-known items with their real IDs and requirements", () => {
    expect(itemCatalog.IronPickaxe).toMatchObject({ id: 1, displayName: "Iron Pickaxe", needed: 1 });
    expect(itemCatalog.DirtBlock).toMatchObject({ id: 2, displayName: "Dirt Block", needed: 100 });
    expect(getItemById(1)?.internalName).toBe("IronPickaxe");
  });

  it("has no duplicate item IDs", () => {
    const ids = itemCatalogList.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
