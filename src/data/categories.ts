/**
 * Item category assignment.
 *
 * Four of the 11 categories are backed by curated ID lists in
 * `pre-data/categories/*.csv` (community-compiled item databases, loaded
 * build-time by `scripts/loadCategoryOverrides.ts`): Weapons, Armor,
 * Vanity, Consumables. ID membership in one of those lists always wins,
 * checked in `categorize()` before any name pattern.
 *
 * Everything else still uses this module's original approach: neither
 * source CSV has a category column and there's no bundled id-to-category
 * reference for the rest of the catalog, so this derives a best-effort
 * category from lexical patterns in the item's display name, using
 * Terraria's own fairly consistent naming conventions (armor pieces end in
 * "Helmet"/"Breastplate"/"Greaves", ammo is named "... Arrow"/"...
 * Bullet", etc). Rules are ordered most-specific-first; first match wins;
 * anything matching nothing lands in "Misc" rather than being force-fit
 * into a wrong bucket — that's also where every removed legacy category
 * (Food, Banners, Paintings, Dyes, Seeds & Plants, Critters & Pets) ends up
 * now, since none of those made this app's 11-category list.
 *
 * Known gap: "Equipment" (pets/light pets/mounts/minecarts/hooks, matching
 * the game's own "Equipment" grouping) has no curated list, and most pets
 * and many mounts have names sharing no reliable common word (nothing
 * links "Ivy Whip", "Web Slinger", "Slimy Saddle", "Cosmic Car Key", ...),
 * so this only catches the literally-named subset — name contains "Hook"/
 * "Minecart"/"Mount"/"Saddle" — and the rest lands in Misc like any other
 * unmatched name. `NAME_OVERRIDES` below corrects the one false-positive
 * this is known to cause (Ivy Whip, a hook, would otherwise match the
 * Weapons "Whip" pattern); add more by hand there if you find others.
 *
 * See README.md "Categories" for more detail.
 */

export const CATEGORIES = [
  "Weapons",
  "Armor",
  "Vanity",
  "Equipment",
  "Accessories",
  "Consumables",
  "Tools",
  "Blocks & Walls",
  "Furniture",
  "Materials",
  "Misc",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Curated id -> category membership, from `loadCategoryOverrides()`. Every
 * field is optional so `categorize()` also works with none supplied (tests,
 * or a name-only call). */
export interface CategoryOverrides {
  weaponIds?: ReadonlySet<number>;
  armorIds?: ReadonlySet<number>;
  vanityIds?: ReadonlySet<number>;
  consumableIds?: ReadonlySet<number>;
}

interface Rule {
  category: Category;
  pattern: RegExp;
}

// Corrects specific known false-positives from the RULES below — not a
// general per-item category table (see module docstring "Known gap").
const NAME_OVERRIDES: Partial<Record<string, Category>> = {
  "Ivy Whip": "Equipment",
};

// Checked before every id override, not just before the Weapons name
// pattern: pickaxes/axes/drills/chainsaws deal damage in-game, so the
// community Weapons CSV reasonably lists them too — but this app wants
// them in Tools regardless of that membership. See module docstring.
const TOOLS_PATTERN = /\b(Pickaxe|Axe|Hamaxe|Hamdrax|Drill|Chainsaw|Fishing Pole|Fishing Rod|Bug Net|Wrench|Bucket)\b/i;

const RULES: Rule[] = [
  { category: "Equipment", pattern: /\b(Hook|Minecart|Mount|Saddle)\b/i },
  { category: "Consumables", pattern: /\b(Arrow|Bullet|Rocket|Dart|Sludge|Potion|Elixir|Flask)s?\b/i },
  {
    category: "Weapons",
    pattern:
      /\b(Sword|Broadsword|Shortsword|Blade|Rapier|Katana|Yoyo|Bow|Repeater|Gun|Rifle|Shotgun|Launcher|Cannon|Staff|Wand|Spear|Trident|Flail|Sickle|Whip|Chakram|Scythe|Boomerang|Minigun)\b/i,
  },
  {
    category: "Armor",
    pattern: /\b(Helmet|Hood|Mask|Headgear|Breastplate|Chestplate|Greaves|Leggings)\b/i,
  },
  {
    category: "Accessories",
    pattern:
      /\b(Wings|Boots|Shoes|Cleats|Shield|Buckler|Emblem|Charm|Amulet|Necklace|Bracelet|Ring|Balloon|Horseshoe|Shackle|Trinket|Pendant|Compass|GPS|Depth Meter|Lifeform Analyzer|Metal Detector|Cloud in a Bottle)\b/i,
  },
  { category: "Blocks & Walls", pattern: /\b(Block|Wall|Brick|Platform|Slab|Pavement)s?\b/i },
  {
    category: "Furniture",
    pattern:
      /\b(Table|Chair|Bed|Chest|Barrel|Bookcase|Bathtub|Sink|Toilet|Chandelier|Lamp|Candle|Clock|Piano|Dresser|Sofa|Bench|Throne|Workbench|Anvil|Furnace|Forge|Loom|Sawmill|Keg|Crate|Statue)\b/i,
  },
  {
    category: "Materials",
    pattern:
      /\b(Ore|Bar|Fragment|Essence|Shard|Gel|Silk|Cloth|Fabric|Chunk|Powder|Dust|Ingot|Scale|Fang|Claw|Hide|Feather|Horn|Tooth|Bone|Stinger|Web)\b/i,
  },
];

export function categorize(displayName: string, id?: number, overrides: CategoryOverrides = {}): Category {
  if (TOOLS_PATTERN.test(displayName)) return "Tools";

  if (id !== undefined) {
    // Consumables before Weapons, Armor before Vanity — see module docstring.
    if (overrides.consumableIds?.has(id)) return "Consumables";
    if (overrides.weaponIds?.has(id)) return "Weapons";
    if (overrides.armorIds?.has(id)) return "Armor";
    if (overrides.vanityIds?.has(id)) return "Vanity";
  }

  const override = NAME_OVERRIDES[displayName];
  if (override) return override;

  for (const rule of RULES) {
    if (rule.pattern.test(displayName)) return rule.category;
  }
  return "Misc";
}
