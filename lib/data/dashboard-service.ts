import { format } from "date-fns";
import { getDataSource } from "@/lib/data/factory";
import type {
  AggregationItem,
  BaseTransaccion,
  DashboardData,
  DashboardFiltros,
  DashboardKPIs,
  HitoObra
} from "@/types/domain";

function sumBy<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + selector(item), 0);
}

function groupByAmount(items: BaseTransaccion[], selector: (tx: BaseTransaccion) => string): AggregationItem[] {
  const map = new Map<string, number>();
  for (const tx of items) {
    const key = selector(tx) || "Sin clasificar";
    map.set(key, (map.get(key) ?? 0) + tx.valorPagado);
  }
  return [...map.entries()].map(([nombre, valor]) => ({ nombre, valor }));
}

function buildKpis(transacciones: BaseTransaccion[], hitos: HitoObra[]): DashboardKPIs {
  const terceros = new Set(transacciones.map((t) => t.tercero).filter(Boolean));
  const responsables = new Set(transacciones.map((t) => t.responsable).filter(Boolean));
  const pagado = sumBy(transacciones, (t) => t.valorPagado);
  const comprometido = sumBy(transacciones, (t) => t.valorComprometido);
  const saldo = sumBy(transacciones, (t) => t.saldoAbierto);

  const hitosPendientes = hitos.filter((h) => h.estado.toLowerCase().includes("pendiente")).length;
  const hitosEnCurso = hitos.filter((h) => h.estado.toLowerCase().includes("curso")).length;
  const hitosHechos = hitos.filter((h) => h.estado.toLowerCase().includes("hecho")).length;

  return {
    pagadoTotal: pagado,
    comprometidoTotal: comprometido,
    saldoAbiertoTotal: saldo,
    numeroTransacciones: transacciones.length,
    numeroTerceros: terceros.size,
    numeroResponsables: responsables.size,
    porcentajeEjecutadoPresupuesto: comprometido === 0 ? 0 : (pagado / comprometido) * 100,
    totalPagadoProveedores: transacciones
      .filter((t) => t.tipoMovimiento.toLowerCase().includes("pago"))
      .reduce((acc, t) => acc + t.valorPagado, 0),
    totalAbonosCajaProyecto: transacciones
      .filter((t) => t.tipoMovimiento.toLowerCase().includes("abono"))
      .reduce((acc, t) => acc + t.valorPagado, 0),
    avancePromedioHitos:
      hitos.length === 0 ? 0 : hitos.reduce((acc, h) => acc + h.avancePorcentaje, 0) / hitos.length,
    hitosPendientes,
    hitosEnCurso,
    hitosHechos
  };
}

function buildSerieMensual(transacciones: BaseTransaccion[]) {
  const map = new Map<string, { pagado: number; comprometido: number }>();
  for (const tx of transacciones) {
    const periodo =
      tx.fecha instanceof Date && !Number.isNaN(tx.fecha.getTime()) ? format(tx.fecha, "yyyy-MM") : "Sin fecha";
    const current = map.get(periodo) ?? { pagado: 0, comprometido: 0 };
    current.pagado += tx.valorPagado;
    current.comprometido += tx.valorComprometido;
    map.set(periodo, current);
  }
  return [...map.entries()]
    .map(([periodo, values]) => ({
      periodo,
      pagado: values.pagado,
      comprometido: values.comprometido
    }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

export async function getDashboardData(filtros?: DashboardFiltros): Promise<DashboardData> {
  const source = getDataSource();
  const [transacciones, hitos] = await Promise.all([
    source.getBaseTransacciones(filtros),
    source.getHitosObra()
  ]);

  return {
    kpis: buildKpis(transacciones, hitos),
    serieMensual: buildSerieMensual(transacciones),
    porCategoria: groupByAmount(transacciones, (tx) => tx.categoria),
    porResponsable: groupByAmount(transacciones, (tx) => tx.responsable),
    ultimosMovimientos: [...transacciones]
      .sort((a, b) => (b.fecha?.getTime() ?? 0) - (a.fecha?.getTime() ?? 0))
      .slice(0, 8)
  };
}
