import { hasPublicCsvConfig } from "@/config/env";
import { EmptyCsvDataSource } from "@/lib/data/empty-csv-source";
import type { ProyectoDataSource } from "@/lib/data/source";
import { PublicCsvSource } from "@/lib/data/public-csv-source";

let singleton: ProyectoDataSource | null = null;

/**
 * Nunca lanza por variables faltantes: sin URLs válidas usa {@link EmptyCsvDataSource}.
 */
export function getDataSource(): ProyectoDataSource {
  if (singleton) return singleton;
  singleton = hasPublicCsvConfig() ? new PublicCsvSource() : new EmptyCsvDataSource();
  return singleton;
}
