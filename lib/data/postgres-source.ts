import type {
  BaseTransaccion,
  Catalogos,
  DashboardFiltros,
  HitoObra,
  PresupuestoItem
} from "@/types/domain";
import type { ProyectoDataSource } from "@/lib/data/source";

export class PostgresSource implements ProyectoDataSource {
  async getBaseTransacciones(_filtros?: DashboardFiltros): Promise<BaseTransaccion[]> {
    throw new Error("PostgresSource no implementado en esta fase.");
  }
  async getPresupuesto(): Promise<PresupuestoItem[]> {
    throw new Error("PostgresSource no implementado en esta fase.");
  }
  async getHitosObra(): Promise<HitoObra[]> {
    throw new Error("PostgresSource no implementado en esta fase.");
  }
  async getCatalogos(): Promise<Catalogos> {
    throw new Error("PostgresSource no implementado en esta fase.");
  }
}
