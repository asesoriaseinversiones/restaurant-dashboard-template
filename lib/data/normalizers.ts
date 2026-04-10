type AnyRecord = Record<string, unknown>;

export function rowsToObjects(rows: string[][]): AnyRecord[] {
  if (!rows.length) return [];
  const [headers, ...dataRows] = rows;
  return dataRows.map((row) => {
    return headers.reduce<AnyRecord>((acc, header, index) => {
      acc[String(header).trim()] = row[index] ?? "";
      return acc;
    }, {});
  });
}
