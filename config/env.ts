import { z } from "zod";

const envSchema = z.object({
  GOOGLE_SHEET_BASE_TRANSACCIONES_CSV: z.string().min(1).optional(),
  GOOGLE_SHEET_PRESUPUESTO_CSV: z.string().min(1).optional(),
  GOOGLE_SHEET_HITOS_OBRA_CSV: z.string().min(1).optional(),
  GOOGLE_SHEET_CATALOGOS_CSV: z.string().min(1).optional()
});

const parsed = envSchema.safeParse({
  GOOGLE_SHEET_BASE_TRANSACCIONES_CSV: process.env.GOOGLE_SHEET_BASE_TRANSACCIONES_CSV,
  GOOGLE_SHEET_PRESUPUESTO_CSV: process.env.GOOGLE_SHEET_PRESUPUESTO_CSV,
  GOOGLE_SHEET_HITOS_OBRA_CSV: process.env.GOOGLE_SHEET_HITOS_OBRA_CSV,
  GOOGLE_SHEET_CATALOGOS_CSV: process.env.GOOGLE_SHEET_CATALOGOS_CSV
});

/** Valores crudos de entorno (CSV público). */
export const env = parsed.success ? parsed.data : {};

export type PublicCsvEnv = z.infer<typeof envSchema>;

/** Misma información que `env`, agrupada para consumo explícito de URLs CSV. */
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
