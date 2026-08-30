/**
 * Item category heuristic.
 *
 * IMPORTANT: neither source CSV contains a category column, and there is no
 * bundled item-ID-to-category reference to join against. Rather than invent
 * per-item category assignments (which the project brief explicitly warns
 * against), this module derives a best-effort category from lexical
 * patterns in the item's display name, using Terraria's own fairly
 * consistent naming conventions (armor pieces end in "Helmet"/"Breastplate"/
 * "Greaves", ammo is named "... Arrow"/"... Bullet", etc).
 *
 * This is intentionally transparent and conservative:
 *   - Rules are ordered most-specific-first; the first match wins.
 *   - Anything that matches nothing lands in "Misc" rather than being
 *     force-fit into a wrong bucket.
 *
 * This is the ONLY place category assignment happens. To improve accuracy,
 * edit the `RULES` list below (or replace `categorize()` entirely with a
 * real id -> category lookup table) — no UI or parser code needs to change.
 * See README.md "Categories" for more detail.
 */

export const CATEGORIES = [
  "Banners",
  "Paintings",
  "Dyes",
  "Seeds & Plants",
  "Critters & Pets",
  "Ammo",
  "Potions",
  "Food",
  "Tools",
  "Weapons",
  "Armor",
  "Accessories",
  "Blocks & Walls",
  "Furniture",
  "Materials",
  "Misc",
] as const;

export type Category = (typeof CATEGORIES)[number];

interface Rule {
  category: Category;
  pattern: RegExp;
}

const RULES: Rule[] = [
  { category: "Banners", pattern: /\bBanner\b/i },
  { category: "Paintings", pattern: /\bPainting\b/i },
  { category: "Dyes", pattern: /\bDye\b/i },
  { category: "Seeds & Plants", pattern: /\bSeeds?\b/i },
  { category: "Critters & Pets", pattern: /\bCage\b/i },
  { category: "Ammo", pattern: /\b(Arrow|Bullet|Rocket|Dart|Sludge)s?\b/i },
  { category: "Potions", pattern: /\b(Potion|Elixir|Flask)s?\b/i },
  {
    category: "Food",
    pattern: /\b(Pie|Cake|Soup|Stew|Burger|Fries|Taco|Sushi|Sashimi|Smoothie|Cocktail|Milkshake|Bowl)\b/i,
  },
  {
    category: "Tools",
    pattern: /\b(Pickaxe|Axe|Hamaxe|Hamdrax|Drill|Chainsaw|Fishing Pole|Fishing Rod|Bug Net|Wrench|Bucket)\b/i,
  },
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

export function categorize(displayName: string): Category {
  for (const rule of RULES) {
    if (rule.pattern.test(displayName)) return rule.category;
  }
  return "Misc";
}
