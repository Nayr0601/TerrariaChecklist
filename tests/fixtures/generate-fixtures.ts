/**
 * Builds synthetic `.plr` fixtures for the parser test suite.
 *
 * No real Terraria save file was supplied with this project, so these are
 * constructed from scratch to match the documented on-disk format (brief
 * §10/§11): the fixed "relogic" header, a plausible run of other
 * version-specific player fields as opaque filler (the parser doesn't need
 * to understand those — see researchParser.ts), the research block itself,
 * and trailing per-version flag bytes after it. They're then AES-128-CBC
 * encrypted with the real Terraria key/IV using Node's built-in
 * `node:crypto` (the app itself only ever uses the browser's Web Crypto
 * API — see src/parser/crypto.ts — this script is test tooling, not
 * shipped code).
 *
 * Run with `npm run generate:fixtures` (also runs automatically before
 * `npm test` via the `pretest` script). Output is gitignored — regenerate
 * instead of committing binaries.
 */
import { createCipheriv, randomBytes } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { itemCatalogList } from "../../src/data/itemCatalog";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = __dirname;

const PASSPHRASE = "h3y_gUyZ";
function utf16LeBytes(s: string): Buffer {
  const out = Buffer.alloc(s.length * 2);
  for (let i = 0; i < s.length; i++) out.writeUInt16LE(s.charCodeAt(i), i * 2);
  return out;
}
const KEY = utf16LeBytes(PASSPHRASE); // also used as the IV, per the real format

function encrypt(plaintext: Buffer): Buffer {
  const cipher = createCipheriv("aes-128-cbc", KEY, KEY);
  return Buffer.concat([cipher.update(plaintext), cipher.final()]); // Node pads with PKCS#7 automatically
}

function u32le(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeInt32LE(n, 0);
  return b;
}

function sevenBitString(s: string): Buffer {
  // .NET 7-bit-encoded length prefix; player names are always short so a
  // single length byte (<128) is enough here.
  if (s.length >= 128) throw new Error("fixture name too long for single-byte 7-bit length");
  return Buffer.concat([Buffer.from([s.length]), Buffer.from(s, "latin1")]);
}

function researchRecord(internalName: string, sacrificed: number): Buffer {
  return Buffer.concat([Buffer.from([internalName.length]), Buffer.from(internalName, "latin1"), u32le(sacrificed)]);
}

/** Builds a full decrypted player buffer: header + filler + research block + trailing bytes. */
function buildPlayer(opts: {
  version: number;
  name: string;
  research: { internalName: string; sacrificed: number }[] | null;
  fillerSize?: number;
  trailingSize?: number;
}): Buffer {
  const { version, name, research, fillerSize = 256, trailingSize = 48 } = opts;

  const header = Buffer.concat([
    u32le(version),
    Buffer.from("relogic", "ascii"),
    Buffer.from([4]), // fileType (player)
    u32le(1), // revision
    Buffer.alloc(8), // favorited (ulong) — unused by the tracker
    sevenBitString(name),
  ]);

  // Opaque filler standing in for the many other version-specific player
  // fields (difficulty, appearance, loadouts, ...) that sit between the
  // name and the research block in a real save. Random on purpose: the
  // research-block scanner (researchParser.ts) is validated to find the
  // real block regardless of what surrounds it, by preferring the largest
  // self-consistent record run.
  const filler = randomBytes(fillerSize);

  const researchBlock = research
    ? Buffer.concat([u32le(research.length), ...research.map((r) => researchRecord(r.internalName, r.sacrificed))])
    : Buffer.alloc(0);

  const trailing = randomBytes(trailingSize);

  return Buffer.concat([header, filler, researchBlock, trailing]);
}

function writeFixture(name: string, plaintext: Buffer) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, name), encrypt(plaintext));
  console.log(`wrote ${name} (${plaintext.length} plaintext bytes)`);
}

function main() {
  const catalog = itemCatalogList;
  if (catalog.length === 0) {
    throw new Error("items.json is empty — run `npm run generate:items` first");
  }

  // 1. All research unlocked (1.4.5-shaped: a slightly higher version int
  //    than the "1.4.4-like" fixture below, exercising a second header
  //    version path through the same parser).
  writeFixture(
    "all-researched-1.4.5.plr",
    buildPlayer({
      version: 279,
      name: "Completionist",
      research: catalog.map((it) => ({ internalName: it.internalName, sacrificed: it.needed })),
    }),
  );

  // 2. Partial research: every 3rd item complete, every other 3rd partial
  //    (1 short of needed, or 1 if needed is already 1), the rest absent
  //    entirely (missing, via "no record").
  const partialRecords = catalog
    .filter((_, i) => i % 3 !== 2)
    .map((it, i) => {
      const complete = i % 2 === 0;
      const sacrificed = complete ? it.needed : Math.max(0, it.needed - 1);
      return { internalName: it.internalName, sacrificed };
    })
    .filter((r) => r.sacrificed > 0);
  writeFixture(
    "partial-research-1.4.4.plr",
    buildPlayer({ version: 230, name: "WorkInProgress", research: partialRecords }),
  );

  // 3. Non-Journey character: valid header, but no research block at all.
  writeFixture("non-journey.plr", buildPlayer({ version: 230, name: "ClassicHero", research: null }));

  // 4. Corrupt / not a Terraria save: random bytes, correctly block-aligned
  //    so it survives the length check but fails AES-CBC padding validation.
  const junk = randomBytes(16 * 20);
  writeFileSync(resolve(OUT_DIR, "corrupt.plr"), junk);
}

main();
