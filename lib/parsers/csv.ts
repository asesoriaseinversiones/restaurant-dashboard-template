/**
 * Parser CSV tipo RFC 4180: comillas dobles, comas escapadas con "", saltos de línea CRLF/LF.
 */
function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

export function parseCsv(text: string): string[][] {
  const input = stripBom(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < input.length) {
    const c = input[i];

    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }

    if (c === "\n") {
      row.push(field);
      if (row.length > 1 || row[0] !== "") {
        rows.push(row);
      }
      row = [];
      field = "";
      i += 1;
      continue;
    }

    field += c;
    i += 1;
  }

  row.push(field);
  if (row.length > 1 || row[0] !== "") {
    rows.push(row);
  }

  while (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last.every((cell) => cell.trim() === "")) {
      rows.pop();
    } else {
      break;
    }
  }

  return rows;
}
