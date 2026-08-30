import { describe, it, expect } from "vitest";
import { parseCsv, parseCsvRecords } from "../../scripts/csv";

describe("parseCsv", () => {
  it("parses simple unquoted rows", () => {
    expect(parseCsv("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles a quoted field containing a comma (the real failure mode in the source CSVs)", () => {
    const csv = 'ID,Name,Internal name\n3596,"Not a Kid, nor a Squid",MoonLordPainting';
    expect(parseCsv(csv)).toEqual([
      ["ID", "Name", "Internal name"],
      ["3596", "Not a Kid, nor a Squid", "MoonLordPainting"],
    ]);
  });

  it("handles doubled double-quotes as an escaped quote", () => {
    expect(parseCsv('a,"he said ""hi""",c')).toEqual([["a", 'he said "hi"', "c"]]);
  });

  it("parseCsvRecords keys rows by the header row", () => {
    const records = parseCsvRecords("ID,Name,Research\n1,Iron Pickaxe,1\n2,Dirt Block,100");
    expect(records).toEqual([
      { ID: "1", Name: "Iron Pickaxe", Research: "1" },
      { ID: "2", Name: "Dirt Block", Research: "100" },
    ]);
  });
});
