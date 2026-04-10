export interface BaseTransaccion {
  id: string;
  fecha: Date | null;
  tipoMovimiento: string;
  categoria: string;
  subcategoria: string;
  tercero: string;
  descripcion: string;
  responsable: string;
  valorComprometido: number;
  valorPagado: number;
  saldoAbierto: number;
  estadoPago: string;
  etapaObra: string;
  fuente: string;
  conciliado: boolean;
  soporteUrl?: string;
  observaciones?: string;
  filaOrigen: number;
  mes: number | null;
  ano: number | null;
}

export interface PresupuestoItem {
  categoria: string;
  presupuestoCop: number;
  ejecutadoCop: number;
  saldoVsPresupuesto: number;
  porcentajeEjecutado: number;
}

export interface HitoObra {
  frente: string;
  tarea: string;
  responsable: string;
  fechaInicio: Date | null;
  fechaObjetivo: Date | null;
  estado: string;
  avancePorcentaje: number;
  semaforo: "verde" | "amarillo" | "rojo" | "gris";
  comentario?: string;
}

export interface Catalogos {
  categorias: string[];
  estadosPago: string[];
  etapasObra: string[];
  responsables: string[];
  tiposMovimiento: string[];
}

export interface DashboardFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  categoria?: string;
  responsable?: string;
  estadoPago?: string;
  etapaObra?: string;
}

export interface DashboardKPIs {
  pagadoTotal: number;
  comprometidoTotal: number;
  saldoAbiertoTotal: number;
  numeroTransacciones: number;
  numeroTerceros: number;
  numeroResponsables: number;
  porcentajeEjecutadoPresupuesto: number;
  totalPagadoProveedores: number;
  totalAbonosCajaProyecto: number;
  avancePromedioHitos: number;
  hitosPendientes: number;
  hitosEnCurso: number;
  hitosHechos: number;
}

export interface SerieMensual {
  periodo: string;
  pagado: number;
  comprometido: number;
}

export interface AggregationItem {
  nombre: string;
  valor: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  serieMensual: SerieMensual[];
  porCategoria: AggregationItem[];
  porResponsable: AggregationItem[];
  ultimosMovimientos: BaseTransaccion[];
}
