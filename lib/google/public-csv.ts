import { parseCsv } from "@/lib/parsers/csv";
import { isSafeCsvFetchUrl } from "@/lib/utils/safe-csv-url";

const LOG_PREFIX = "[Dashboard CSV]";

export async function fetchPublicCsvRows(
  sheetLabel: string,
  url: string | undefined,
  revalidateSeconds: number
): Promise<string[][]> {
  const trimmed = url?.trim() ?? "";
  if (!trimmed || !isSafeCsvFetchUrl(trimmed)) {
    console.warn(
      `${LOG_PREFIX} ${sheetLabel}: URL omitida (vacía, inválida o no permitida para fetch).`
    );
    return [];
  }

  try {
    const response = await fetch(trimmed, {
      headers: { Accept: "text/csv,*/*" },
      next: { revalidate: revalidateSeconds }
    });

    if (!response.ok) {
      const body = await response.text();
      const urlPreview = trimmed.length > 120 ? `${trimmed.slice(0, 120)}…` : trimmed;
      console.error(
        `${LOG_PREFIX} ${sheetLabel}: fallo HTTP ${response.status} ${response.statusText}. URL: ${urlPreview}. Cuerpo (primeros 400 chars): ${body.slice(0, 400)}`
      );
      return [];
    }

    const text = await response.text();
    let rows: string[][];
    try {
      rows = parseCsv(text);
    } catch (parseErr) {
      console.error(`${LOG_PREFIX} ${sheetLabel}: error al parsear CSV.`, parseErr);
      return [];
    }

    if (rows.length === 0) {
      console.warn(`${LOG_PREFIX} ${sheetLabel}: CSV sin filas parseables.`);
    }

    return rows;
  } catch (err) {
    console.error(`${LOG_PREFIX} ${sheetLabel}: error al descargar o parsear CSV.`, err);
    return [];
  }
}
