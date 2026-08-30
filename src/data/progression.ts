import type { RarityTier } from "./rarity";

/**
 * Progression checklist content — bosses, events, and town NPCs.
 *
 * This is hand-authored app data (not derivable from the item CSVs) kept
 * entirely separate from the Progression view's UI. To add a new boss,
 * event, or NPC (e.g. after a future update), add an entry to the
 * relevant section below — no component code needs to change. Each entry
 * only needs a stable `id` (used as the localStorage key, so don't rename
 * an existing one — see `usePersistentChecklist.ts`), a `name`, and a
 * `tier` used purely for the rarity-ladder accent color (see `rarity.ts`);
 * tiers here are a hand-picked rough difficulty/progression ordering, not
 * an authoritative game value.
 */
export interface ProgressionEntry {
  id: string;
  name: string;
  tier: RarityTier;
}

export interface ProgressionSection {
  id: string;
  title: string;
  /** Stamp verb shown on a completed tile, e.g. "DEFEATED". */
  verb: string;
  entries: ProgressionEntry[];
}

export const PROGRESSION_SECTIONS: ProgressionSection[] = [
  {
    id: "bosses-prehm",
    title: "Pre-Hardmode Bosses",
    verb: "DEFEATED",
    entries: [
      { id: "king-slime", name: "King Slime", tier: "white" },
      { id: "eye-of-cthulhu", name: "Eye of Cthulhu", tier: "white" },
      { id: "eater-of-worlds", name: "Eater of Worlds", tier: "blue" },
      { id: "brain-of-cthulhu", name: "Brain of Cthulhu", tier: "blue" },
      { id: "queen-bee", name: "Queen Bee", tier: "blue" },
      { id: "skeletron", name: "Skeletron", tier: "green" },
      { id: "deerclops", name: "Deerclops", tier: "green" },
      { id: "wall-of-flesh", name: "Wall of Flesh", tier: "orange" },
    ],
  },
  {
    id: "bosses-hm",
    title: "Hardmode Bosses",
    verb: "DEFEATED",
    entries: [
      { id: "queen-slime", name: "Queen Slime", tier: "orange" },
      { id: "the-twins", name: "The Twins", tier: "orange" },
      { id: "the-destroyer", name: "The Destroyer", tier: "orange" },
      { id: "skeletron-prime", name: "Skeletron Prime", tier: "orange" },
      { id: "plantera", name: "Plantera", tier: "pink" },
      { id: "golem", name: "Golem", tier: "pink" },
      { id: "duke-fishron", name: "Duke Fishron", tier: "lime" },
      { id: "empress-of-light", name: "Empress of Light", tier: "lime" },
      { id: "lunatic-cultist", name: "Lunatic Cultist", tier: "lime" },
      { id: "moon-lord", name: "Moon Lord", tier: "red" },
    ],
  },
  {
    id: "events",
    title: "Events",
    verb: "CLEARED",
    entries: [
      { id: "goblin-army", name: "Goblin Army", tier: "white" },
      { id: "blood-moon", name: "Blood Moon", tier: "white" },
      { id: "old-ones-army", name: "Old One's Army", tier: "blue" },
      { id: "pirate-invasion", name: "Pirate Invasion", tier: "green" },
      { id: "frost-legion", name: "Frost Legion", tier: "green" },
      { id: "solar-eclipse", name: "Solar Eclipse", tier: "orange" },
      { id: "pumpkin-moon", name: "Pumpkin Moon", tier: "orange" },
      { id: "frost-moon", name: "Frost Moon", tier: "pink" },
      { id: "martian-madness", name: "Martian Madness", tier: "lime" },
      { id: "lunar-events", name: "Lunar Events", tier: "red" },
    ],
  },
  {
    id: "npcs",
    title: "Town NPCs",
    verb: "MOVED IN",
    entries: [
      { id: "guide", name: "Guide", tier: "white" },
      { id: "merchant", name: "Merchant", tier: "white" },
      { id: "nurse", name: "Nurse", tier: "white" },
      { id: "demolitionist", name: "Demolitionist", tier: "white" },
      { id: "dye-trader", name: "Dye Trader", tier: "white" },
      { id: "angler", name: "Angler", tier: "white" },
      { id: "dryad", name: "Dryad", tier: "blue" },
      { id: "arms-dealer", name: "Arms Dealer", tier: "blue" },
      { id: "stylist", name: "Stylist", tier: "blue" },
      { id: "painter", name: "Painter", tier: "blue" },
      { id: "golfer", name: "Golfer", tier: "blue" },
      { id: "tavernkeep", name: "Tavernkeep", tier: "blue" },
      { id: "zoologist", name: "Zoologist", tier: "blue" },
      { id: "goblin-tinkerer", name: "Goblin Tinkerer", tier: "green" },
      { id: "wizard", name: "Wizard", tier: "green" },
      { id: "mechanic", name: "Mechanic", tier: "green" },
      { id: "party-girl", name: "Party Girl", tier: "green" },
      { id: "witch-doctor", name: "Witch Doctor", tier: "green" },
      { id: "clothier", name: "Clothier", tier: "green" },
      { id: "tax-collector", name: "Tax Collector", tier: "orange" },
      { id: "truffle", name: "Truffle", tier: "orange" },
      { id: "steampunker", name: "Steampunker", tier: "orange" },
      { id: "pirate", name: "Pirate", tier: "orange" },
      { id: "cyborg", name: "Cyborg", tier: "pink" },
      { id: "santa-claus", name: "Santa Claus", tier: "pink" },
      { id: "princess", name: "Princess", tier: "red" },
    ],
  },
];
