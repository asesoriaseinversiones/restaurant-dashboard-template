import { z } from "zod";

/**
 * Primera URL no vacía entre varios nombres de variable (Google Sheets / Vercel / NEXT_PUBLIC).
 */
function pickCsvUrl(...candidates: (string | undefined)[]): string | undefined {
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return undefined;
}

const rawPublicCsv = {
  GOOGLE_SHEET_BASE_TRANSACCIONES_CSV: pickCsvUrl(
    process.env.GOOGLE_SHEET_BASE_TRANSACCIONES_CSV,
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_BASE_TRANSACCIONES_CSV,
    process.env.NEXT_PUBLIC_TRANSACCIONES_CSV_URL,
    process.env.NEXT_PUBLIC_CSV_URL
  ),
  GOOGLE_SHEET_PRESUPUESTO_CSV: pickCsvUrl(
    process.env.GOOGLE_SHEET_PRESUPUESTO_CSV,
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_PRESUPUESTO_CSV,
    process.env.NEXT_PUBLIC_PRESUPUESTO_CSV_URL
  ),
  GOOGLE_SHEET_HITOS_OBRA_CSV: pickCsvUrl(
    process.env.GOOGLE_SHEET_HITOS_OBRA_CSV,
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_HITOS_OBRA_CSV,
    process.env.NEXT_PUBLIC_HITOS_CSV_URL
  ),
  GOOGLE_SHEET_CATALOGOS_CSV: pickCsvUrl(
    process.env.GOOGLE_SHEET_CATALOGOS_CSV,
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_CATALOGOS_CSV,
    process.env.NEXT_PUBLIC_CATALOGOS_CSV_URL
  )
};

const envSchema = z.object({
  GOOGLE_SHEET_BASE_TRANSACCIONES_CSV: z.string().min(1).optional(),
  GOOGLE_SHEET_PRESUPUESTO_CSV: z.string().min(1).optional(),
  GOOGLE_SHEET_HITOS_OBRA_CSV: z.string().min(1).optional(),
  GOOGLE_SHEET_CATALOGOS_CSV: z.string().min(1).optional()
});

const parsed = envSchema.safeParse(rawPublicCsv);

/** Valores resueltos de entorno (CSV público). */
export const env = parsed.success ? parsed.data : {};

export type PublicCsvEnv = z.infer<typeof envSchema>;

/** URLs efectivas para consumo de CSV. */
export const publicCsvConfig = {
  GOOGLE_SHEET_BASE_TRANSACCIONES_CSV: env.GOOGLE_SHEET_BASE_TRANSACCIONES_CSV,
  GOOGLE_SHEET_PRESUPUESTO_CSV: env.GOOGLE_SHEET_PRESUPUESTO_CSV,
  GOOGLE_SHEET_HITOS_OBRA_CSV: env.GOOGLE_SHEET_HITOS_OBRA_CSV,
  GOOGLE_SHEET_CATALOGOS_CSV: env.GOOGLE_SHEET_CATALOGOS_CSV
} as const;

function isHttpUrl(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** True si las cuatro URLs CSV están definidas y son http(s). */
export function hasPublicCsvConfig(): boolean {
  return (
    isHttpUrl(publicCsvConfig.GOOGLE_SHEET_BASE_TRANSACCIONES_CSV) &&
    isHttpUrl(publicCsvConfig.GOOGLE_SHEET_PRESUPUESTO_CSV) &&
    isHttpUrl(publicCsvConfig.GOOGLE_SHEET_HITOS_OBRA_CSV) &&
    isHttpUrl(publicCsvConfig.GOOGLE_SHEET_CATALOGOS_CSV)
  );
}

/** Por variable: si la URL es válida (para pantalla de configuración). */
export function getPublicCsvUrlStatus(): Record<string, boolean> {
  return {
    GOOGLE_SHEET_BASE_TRANSACCIONES_CSV: isHttpUrl(
      publicCsvConfig.GOOGLE_SHEET_BASE_TRANSACCIONES_CSV
    ),
    GOOGLE_SHEET_PRESUPUESTO_CSV: isHttpUrl(publicCsvConfig.GOOGLE_SHEET_PRESUPUESTO_CSV),
    GOOGLE_SHEET_HITOS_OBRA_CSV: isHttpUrl(publicCsvConfig.GOOGLE_SHEET_HITOS_OBRA_CSV),
    GOOGLE_SHEET_CATALOGOS_CSV: isHttpUrl(publicCsvConfig.GOOGLE_SHEET_CATALOGOS_CSV)
  };
}
