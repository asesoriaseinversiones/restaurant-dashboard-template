import { format } from "date-fns";
import { unstable_cache } from "next/cache";
import { env } from "@/config/env";
import { fetchPublicCsvRows } from "@/lib/google/public-csv";
import { parseBoolean, parseDate, parseInteger, parseNumber, parsePercentage, parseText } from "@/lib/parsers";
import { rowsToObjects } from "@/lib/data/normalizers";
import type {
  BaseTransaccion,
  Catalogos,
  DashboardFiltros,
  HitoObra,
  PresupuestoItem
} from "@/types/domain";
import type { ProyectoDataSource } from "@/lib/data/source";

function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function getValue(row: Record<string, string>, aliases: string[]): string {
  const normalized = new Map<string, string>();
  for (const [key, value] of Object.entries(row)) {
    normalized.set(normalizeHeader(key), value);
  }
  for (const alias of aliases) {
    const hit = normalized.get(normalizeHeader(alias));
    if (hit !== undefined) return hit;
  }
  return "";
}

function applyTransaccionesFilters(
  transacciones: BaseTransaccion[],
  filtros?: DashboardFiltros
) {
  if (!filtros) return transacciones;

  const from = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
  const to = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

  return transacciones.filter((t) => {
    const matchCategoria = !filtros.categoria || t.categoria === filtros.categoria;
    const matchResponsable = !filtros.responsable || t.responsable === filtros.responsable;
    const matchEstadoPago = !filtros.estadoPago || t.estadoPago === filtros.estadoPago;
    const matchEtapaObra = !filtros.etapaObra || t.etapaObra === filtros.etapaObra;
    const matchSede = !filtros.sede || t.sede === filtros.sede;
    const matchCanal = !filtros.canal || t.canal === filtros.canal;

    const matchMes =
      !filtros.mes ||
      (t.fecha instanceof Date &&
        !Number.isNaN(t.fecha.getTime()) &&
        format(t.fecha, "yyyy-MM") === filtros.mes);

    const matchFrom = !from || !t.fecha || t.fecha >= from;
    const matchTo = !to || !t.fecha || t.fecha <= to;

    return (
      matchCategoria &&
      matchResponsable &&
      matchEstadoPago &&
      matchEtapaObra &&
      matchSede &&
      matchCanal &&
      matchMes &&
      matchFrom &&
      matchTo
    );
  });
}

const getBaseRows = unstable_cache(
  async () =>
    fetchPublicCsvRows("Base_Transacciones", env.GOOGLE_SHEET_BASE_TRANSACCIONES_CSV, 300),
  ["csv-base-transacciones"],
  { revalidate: 300 }
);

const getPresupuestoRows = unstable_cache(
  async () => fetchPublicCsvRows("Presupuesto", env.GOOGLE_SHEET_PRESUPUESTO_CSV, 600),
  ["csv-presupuesto"],
  { revalidate: 600 }
);

const getHitosRows = unstable_cache(
  async () => fetchPublicCsvRows("Hitos_Obra", env.GOOGLE_SHEET_HITOS_OBRA_CSV, 600),
  ["csv-hitos-obra"],
  { revalidate: 600 }
);

const getCatalogosRows = unstable_cache(
  async () => fetchPublicCsvRows("Catalogos", env.GOOGLE_SHEET_CATALOGOS_CSV, 1800),
  ["csv-catalogos"],
  { revalidate: 1800 }
);

export class PublicCsvSource implements ProyectoDataSource {
  async getBaseTransacciones(filtros?: DashboardFiltros): Promise<BaseTransaccion[]> {
    const rows = await getBaseRows();
    const objects = rowsToObjects(rows) as Record<string, string>[];

    const transacciones: BaseTransaccion[] = objects.map((row) => ({
      id: parseText(getValue(row, ["ID"])),
      fecha: parseDate(getValue(row, ["Fecha"])),
      tipoMovimiento: parseText(getValue(row, ["Tipo_movimiento", "Tipo movimiento"])),
      categoria: parseText(getValue(row, ["Categoria"])),
      subcategoria: parseText(getValue(row, ["Subcategoria"])),
      tercero: parseText(getValue(row, ["Tercero"])),
      descripcion: parseText(getValue(row, ["Descripcion", "Descripción"])),
      responsable: parseText(getValue(row, ["Responsable"])),
      valorComprometido: parseNumber(getValue(row, ["Valor_comprometido", "Valor comprometido"])),
      valorPagado: parseNumber(getValue(row, ["Valor_pagado", "Valor pagado"])),
      saldoAbierto: parseNumber(getValue(row, ["Saldo_abierto", "Saldo abierto"])),
      estadoPago: parseText(getValue(row, ["Estado_pago", "Estado pago"])),
      etapaObra: parseText(getValue(row, ["Etapa_obra", "Etapa obra"])),
      fuente: parseText(getValue(row, ["Fuente"])),
      conciliado: parseBoolean(getValue(row, ["Conciliado"])),
      soporteUrl: parseText(getValue(row, ["Soporte_URL", "Soporte URL"])) || undefined,
      observaciones: parseText(getValue(row, ["Observaciones"])) || undefined,
      filaOrigen: parseInteger(getValue(row, ["Fila_origen", "Fila origen"])) ?? 0,
      mes: parseInteger(getValue(row, ["Mes"])),
      ano: parseInteger(getValue(row, ["Ano", "Año"])),
      sede: parseText(getValue(row, ["Sede", "Local", "Ubicacion", "Ubicación", "Venue"])),
      canal: parseText(getValue(row, ["Canal", "Channel"]))
    }));

    return applyTransaccionesFilters(transacciones, filtros);
  }

  async getPresupuesto(): Promise<PresupuestoItem[]> {
    const rows = await getPresupuestoRows();
    const objects = rowsToObjects(rows) as Record<string, string>[];

    return objects.map((row) => ({
      categoria: parseText(getValue(row, ["Categoria"])),
      presupuestoCop: parseNumber(getValue(row, ["Presupuesto_COP", "Presupuesto COP"])),
      ejecutadoCop: parseNumber(getValue(row, ["Ejecutado_COP", "Ejecutado COP"])),
      saldoVsPresupuesto: parseNumber(
        getValue(row, ["Saldo_vs_presupuesto", "Saldo vs presupuesto"])
      ),
      porcentajeEjecutado: parsePercentage(getValue(row, ["%_ejecutado", "% ejecutado"]))
    }));
  }

  async getHitosObra(): Promise<HitoObra[]> {
    const rows = await getHitosRows();
    const objects = rowsToObjects(rows) as Record<string, string>[];

    return objects.map((row) => {
      const semaforoValue = parseText(getValue(row, ["Semaforo", "Semáforo"])).toLowerCase();
      const semaforo =
        semaforoValue === "verde" || semaforoValue === "amarillo" || semaforoValue === "rojo"
          ? semaforoValue
          : "gris";

      return {
        frente: parseText(getValue(row, ["Frente"])),
        tarea: parseText(getValue(row, ["Tarea"])),
        responsable: parseText(getValue(row, ["Responsable"])),
        fechaInicio: parseDate(getValue(row, ["Fecha_inicio", "Fecha inicio"])),
        fechaObjetivo: parseDate(getValue(row, ["Fecha_objetivo", "Fecha objetivo"])),
        estado: parseText(getValue(row, ["Estado"])),
        avancePorcentaje: parsePercentage(getValue(row, ["Avance_%", "Avance %"])),
        semaforo,
        comentario: parseText(getValue(row, ["Comentario"])) || undefined
      } as HitoObra;
    });
  }

  async getCatalogos(): Promise<Catalogos> {
    const [rows, baseRows] = await Promise.all([getCatalogosRows(), getBaseRows()]);
    const objects = rowsToObjects(rows) as Record<string, string>[];
    const baseObjects = rowsToObjects(baseRows) as Record<string, string>[];

    const categories = new Set<string>();
    const estadosPago = new Set<string>();
    const etapas = new Set<string>();
    const responsables = new Set<string>();
    const tipos = new Set<string>();
    const sedes = new Set<string>();
    const canales = new Set<string>();

    for (const row of objects) {
      const categoria = parseText(getValue(row, ["Categorias", "Categoria"]));
      const estado = parseText(getValue(row, ["Estados_pago", "Estado_pago", "Estado"]));
      const etapa = parseText(getValue(row, ["Etapas_obra", "Etapa_obra", "Etapa"]));
      const responsable = parseText(getValue(row, ["Responsables", "Responsable"]));
      const tipo = parseText(getValue(row, ["Tipos_movimiento", "Tipo_movimiento", "Tipo"]));

      if (categoria) categories.add(categoria);
      if (estado) estadosPago.add(estado);
      if (etapa) etapas.add(etapa);
      if (responsable) responsables.add(responsable);
      if (tipo) tipos.add(tipo);
    }

    for (const row of baseObjects) {
      const sede = parseText(getValue(row, ["Sede", "Local", "Ubicacion", "Ubicación", "Venue"]));
      const canal = parseText(getValue(row, ["Canal", "Channel"]));
      if (sede) sedes.add(sede);
      if (canal) canales.add(canal);
    }

    return {
      categorias: [...categories].filter(Boolean),
      estadosPago: [...estadosPago].filter(Boolean),
      etapasObra: [...etapas].filter(Boolean),
      responsables: [...responsables].filter(Boolean),
      tiposMovimiento: [...tipos].filter(Boolean),
      sedes: [...sedes].sort((a, b) => a.localeCompare(b, "es")),
      canales: [...canales].sort((a, b) => a.localeCompare(b, "es"))
    };
  }
}
