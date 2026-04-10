import { hasPublicCsvConfig } from "@/config/env";
import type { ProyectoDataSource } from "@/lib/data/source";
import { PublicCsvSource } from "@/lib/data/public-csv-source";

let singleton: ProyectoDataSource | null = null;

export function getDataSource(): ProyectoDataSource {
  if (singleton) return singleton;
  if (!hasPublicCsvConfig()) {
    throw new Error(
      "Configura las cuatro URLs CSV públicas: GOOGLE_SHEET_BASE_TRANSACCIONES_CSV, GOOGLE_SHEET_PRESUPUESTO_CSV, GOOGLE_SHEET_HITOS_OBRA_CSV, GOOGLE_SHEET_CATALOGOS_CSV (https://…)."
    );
  }
  singleton = new PublicCsvSource();
  return singleton;
}
