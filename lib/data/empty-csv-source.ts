import type { ProyectoDataSource } from "@/lib/data/source";
import type {
  BaseTransaccion,
  Catalogos,
  DashboardFiltros,
  HitoObra,
  PresupuestoItem
} from "@/types/domain";

const EMPTY_CATALOGOS: Catalogos = {
  categorias: [],
  estadosPago: [],
  etapasObra: [],
  responsables: [],
  tiposMovimiento: [],
  sedes: [],
  canales: []
};

/**
 * Fuente sin red: usada cuando faltan URLs CSV válidas (p. ej. Vercel sin env).
 * No lanza; devuelve colecciones vacías.
 */
export class EmptyCsvDataSource implements ProyectoDataSource {
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
