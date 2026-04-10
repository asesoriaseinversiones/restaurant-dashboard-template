import type {
  BaseTransaccion,
  Catalogos,
  DashboardFiltros,
  HitoObra,
  PresupuestoItem
} from "@/types/domain";

export interface ProyectoDataSource {
  getBaseTransacciones(filtros?: DashboardFiltros): Promise<BaseTransaccion[]>;
  getPresupuesto(): Promise<PresupuestoItem[]>;
  getHitosObra(): Promise<HitoObra[]>;
  getCatalogos(): Promise<Catalogos>;
}
