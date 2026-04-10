import type {
  BaseTransaccion,
  Catalogos,
  DashboardFiltros,
  HitoObra,
  PresupuestoItem
} from "@/types/domain";
import type { ProyectoDataSource } from "@/lib/data/source";

const EMPTY_CATALOGOS: Catalogos = {
  categorias: [],
  estadosPago: [],
  etapasObra: [],
  responsables: [],
  tiposMovimiento: [],
  sedes: [],
  canales: []
};

/** Stub sin lanzar: devuelve colecciones vacías hasta implementar Postgres. */
export class PostgresSource implements ProyectoDataSource {
  async getBaseTransacciones(_filtros?: DashboardFiltros): Promise<BaseTransaccion[]> {
    void _filtros;
    return [];
  }
  async getPresupuesto(): Promise<PresupuestoItem[]> {
    return [];
  }
  async getHitosObra(): Promise<HitoObra[]> {
    return [];
  }
  async getCatalogos(): Promise<Catalogos> {
    return { ...EMPTY_CATALOGOS };
  }
}
