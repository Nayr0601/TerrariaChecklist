import { describe, it, expect } from "vitest";
import { categorize } from "../../src/data/categories";

describe("categorize (item category heuristic)", () => {
  describe("name-pattern rules (no id/overrides)", () => {
    it.each([
      ["Iron Broadsword", "Weapons"],
      ["Molten Helmet", "Armor"],
      ["Adamantite Breastplate", "Armor"],
      ["Hermes Boots", "Accessories"],
      ["Iron Ore", "Materials"],
      ["Dirt Block", "Blocks & Walls"],
      ["Iron Anvil", "Furniture"],
      ["Iron Pickaxe", "Tools"],
      ["Wooden Arrow", "Consumables"],
      ["Lesser Healing Potion", "Consumables"],
      ["Grappling Hook", "Equipment"],
      ["Wooden Minecart", "Equipment"],
      ["Slimy Saddle", "Equipment"],
      ["Ivy Whip", "Equipment"],
    ])("categorizes %s as %s", (name, expected) => {
      expect(categorize(name)).toBe(expected);
    });

    it.each([
      ["Goblin Banner", "no dedicated Banners category anymore"],
      ["Sunflower Seeds", "no dedicated Seeds & Plants category anymore"],
      ["Red Dye", "no dedicated Dyes category anymore"],
      ["Bunny Cage", "no dedicated Critters & Pets category anymore"],
      ["Grand Design", "matches no pattern at all"],
    ])("falls back to Misc for %s (%s)", (name, _reason) => {
      expect(categorize(name)).toBe("Misc");
    });
  });

  describe("id-based overrides (curated CSV lists)", () => {
    const overrides = {
      weaponIds: new Set([100]),
      armorIds: new Set([200]),
      vanityIds: new Set([300]),
      consumableIds: new Set([400]),
    };

    it("uses the weapon list even for a name matching no weapon pattern", () => {
      expect(categorize("Abigail's Flower", 100, overrides)).toBe("Weapons");
    });

    it("uses the armor list even for a name matching no armor pattern", () => {
      expect(categorize("Familiar Shirt", 200, overrides)).toBe("Armor");
    });

    it("uses the vanity list for a cosmetic-only piece", () => {
      expect(categorize("Ninja Hood", 300, overrides)).toBe("Vanity");
    });

    it("uses the consumable list for a name matching no consumable pattern", () => {
      expect(categorize("Bomb", 400, overrides)).toBe("Consumables");
    });

    it("consumable membership wins over weapon membership (e.g. bombs list in both source CSVs)", () => {
      const both = { weaponIds: new Set([500]), consumableIds: new Set([500]) };
      expect(categorize("Dynamite", 500, both)).toBe("Consumables");
    });

    it("armor membership wins over vanity membership (e.g. Ninja/Rain gear list in both source CSVs)", () => {
      const both = { armorIds: new Set([600]), vanityIds: new Set([600]) };
      expect(categorize("Rain Coat", 600, both)).toBe("Armor");
    });

    it("falls through to name patterns when the id isn't in any override list", () => {
      expect(categorize("Molten Helmet", 999, overrides)).toBe("Armor");
    });

    it("ignores overrides entirely when no id is passed", () => {
      expect(categorize("Zenith", undefined, overrides)).toBe("Misc");
    });
  });

  it("falls back to Misc for a name that matches no rule, rather than guessing", () => {
    expect(categorize("Zenith")).toBe("Misc");
  });
});
