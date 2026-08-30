/**
 * Minimal RFC4180-ish CSV parser.
 *
 * The two source spreadsheets are simple (no embedded newlines inside
 * fields), but a handful of item names contain commas
 * (e.g. `"Snakes, I Hate Snakes"`) and are correctly double-quoted by the
 * export, so a naive `line.split(",")` silently corrupts those rows. This
 * parser handles quoted fields and doubled `""` quote-escaping without
 * pulling in a dependency for two small build-time files.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Normalize line endings and strip a trailing newline so we don't emit
  // a bogus empty final row.
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];

    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }

  // Final field/row (files may or may not end with a trailing newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

/** Parse CSV text with a header row into an array of objects keyed by header name. */
export function parseCsvRecords(text: string): Record<string, string>[] {
  const rows = parseCsv(text);
  const [header, ...rest] = rows;
  return rest.map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((key, idx) => {
      obj[key] = r[idx] ?? "";
    });
    return obj;
  });
}
