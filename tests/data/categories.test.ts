import { describe, it, expect } from "vitest";
import { categorize } from "../../src/data/categories";

describe("categorize (item category heuristic)", () => {
  it.each([
    ["Iron Broadsword", "Weapons"],
    ["Molten Helmet", "Armor"],
    ["Adamantite Breastplate", "Armor"],
    ["Hermes Boots", "Accessories"],
    ["Wooden Arrow", "Ammo"],
    ["Lesser Healing Potion", "Potions"],
    ["Iron Ore", "Materials"],
    ["Dirt Block", "Blocks & Walls"],
    ["Iron Anvil", "Furniture"],
    ["Iron Pickaxe", "Tools"],
    ["Goblin Banner", "Banners"],
    ["Sunflower Seeds", "Seeds & Plants"],
    ["Red Dye", "Dyes"],
  ])("categorizes %s as %s", (name, expected) => {
    expect(categorize(name)).toBe(expected);
  });

  it("falls back to Misc for a name that matches no rule, rather than guessing", () => {
    expect(categorize("Zenith")).toBe("Misc");
  });
});
