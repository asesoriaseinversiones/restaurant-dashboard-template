import { format } from "date-fns";
import type { BaseTransaccion, HitoObra, PresupuestoItem } from "@/types/domain";
import type {
  BudgetLine,
  NamedAmount,
  OperationalHealth,
  OperationalTask,
  PayableSummary,
  PeriodCashflowSlice,
  RestaurantExecutiveKpis,
  RestaurantTransaction,
  RestaurantTransactionKind,
  SalesMonthSlice
} from "@/lib/types/restaurant";

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** Heuristic from legacy `tipoMovimiento` only — CSV unchanged */
export function classifyTransactionKind(tx: BaseTransaccion): RestaurantTransactionKind {
  const t = norm(tx.tipoMovimiento);
  if (t.includes("abono")) return "cash_inflow";
  if (t.includes("pago")) return "supplier_payment";
  if (t.includes("compromiso") || (tx.valorComprometido > 0 && tx.valorPagado === 0)) {
    return "commitment";
  }
  return "other";
}

export function mapBaseTransaccionToRestaurantTransaction(tx: BaseTransaccion): RestaurantTransaction {
  return {
    id: tx.id,
    occurredOn: tx.fecha,
    kind: classifyTransactionKind(tx),
    category: tx.categoria,
    subcategory: tx.subcategoria,
    counterpartyName: tx.tercero,
    description: tx.descripcion,
    ownerLabel: tx.responsable,
    amountPaid: tx.valorPagado,
    amountCommitted: tx.valorComprometido,
    openBalance: tx.saldoAbierto,
    paymentStatus: tx.estadoPago,
    opsStageLabel: tx.etapaObra,
    sourceLabel: tx.fuente,
    reconciled: tx.conciliado,
    supportUrl: tx.soporteUrl,
    notes: tx.observaciones,
    venueId: tx.sede.trim() || null,
    channel: tx.canal.trim() || null,
    legacy: tx
  };
}

export function mapPresupuestoItemToBudgetLine(row: PresupuestoItem): BudgetLine {
  return {
    categoryKey: row.categoria,
    budgetAmount: row.presupuestoCop,
    actualAmount: row.ejecutadoCop,
    varianceToBudget: row.saldoVsPresupuesto,
    percentUtilized: row.porcentajeEjecutado
  };
}

function hitoId(h: HitoObra, index: number): string {
  return `${h.frente}-${h.tarea}-${index}`.replace(/\s+/g, "_");
}

const SEMAFORO_TO_HEALTH: Record<HitoObra["semaforo"], OperationalHealth> = {
  verde: "green",
  amarillo: "yellow",
  rojo: "red",
  gris: "neutral"
};

export function mapHitoObraToOperationalTask(h: HitoObra, index: number): OperationalTask {
  return {
    id: hitoId(h, index),
    area: h.frente,
    title: h.tarea,
    assignee: h.responsable,
    startsOn: h.fechaInicio,
    dueOn: h.fechaObjetivo,
    statusLabel: h.estado,
    progressPercent: h.avancePorcentaje,
    health: SEMAFORO_TO_HEALTH[h.semaforo],
    notes: h.comentario
  };
}

function sumBy<T>(items: T[], pick: (x: T) => number): number {
  return items.reduce((a, x) => a + pick(x), 0);
}

export function groupPaidBy(
  txs: RestaurantTransaction[],
  keyFn: (t: RestaurantTransaction) => string
): NamedAmount[] {
  const map = new Map<string, number>();
  for (const t of txs) {
    const k = keyFn(t) || "Sin clasificar";
    map.set(k, (map.get(k) ?? 0) + t.amountPaid);
  }
  return [...map.entries()].map(([key, amount]) => ({ key, amount }));
}

export function buildPayableSummaries(legacy: BaseTransaccion[]): PayableSummary[] {
  const map = new Map<string, { open: number; lines: number }>();
  for (const tx of legacy) {
    if (tx.saldoAbierto <= 0) continue;
    const name = tx.tercero.trim() || "Sin nombre";
    const cur = map.get(name) ?? { open: 0, lines: 0 };
    cur.open += tx.saldoAbierto;
    cur.lines += 1;
    map.set(name, cur);
  }
  return [...map.entries()]
    .map(([counterpartyName, v]) => ({
      counterpartyName,
      openAmount: v.open,
      lineCount: v.lines
    }))
    .sort((a, b) => b.openAmount - a.openAmount);
}

function monthKeyFromTx(t: RestaurantTransaction): string {
  return t.occurredOn instanceof Date && !Number.isNaN(t.occurredOn.getTime())
    ? format(t.occurredOn, "yyyy-MM")
    : "Sin fecha";
}

export function buildSpendingByMonth(txs: RestaurantTransaction[]): PeriodCashflowSlice[] {
  const map = new Map<string, { paidOut: number; committed: number }>();
  for (const t of txs) {
    const periodKey = monthKeyFromTx(t);
    const cur = map.get(periodKey) ?? { paidOut: 0, committed: 0 };
    cur.paidOut += t.amountPaid;
    cur.committed += t.amountCommitted;
    map.set(periodKey, cur);
  }
  return [...map.entries()]
    .map(([periodKey, v]) => ({
      periodKey,
      paidOut: v.paidOut,
      committed: v.committed
    }))
    .sort((a, b) => a.periodKey.localeCompare(b.periodKey));
}

/** Monthly egresos / compromisos excluding caja inflows. */
export function buildExpenseSpendingByMonth(txs: RestaurantTransaction[]): PeriodCashflowSlice[] {
  const map = new Map<string, { paidOut: number; committed: number }>();
  for (const t of txs) {
    if (t.kind === "cash_inflow") continue;
    const periodKey = monthKeyFromTx(t);
    const cur = map.get(periodKey) ?? { paidOut: 0, committed: 0 };
    cur.paidOut += t.amountPaid;
    cur.committed += t.amountCommitted;
    map.set(periodKey, cur);
  }
  return [...map.entries()]
    .map(([periodKey, v]) => ({
      periodKey,
      paidOut: v.paidOut,
      committed: v.committed
    }))
    .sort((a, b) => a.periodKey.localeCompare(b.periodKey));
}

export function buildSalesByMonth(txs: RestaurantTransaction[]): SalesMonthSlice[] {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (t.kind !== "cash_inflow") continue;
    const periodKey = monthKeyFromTx(t);
    map.set(periodKey, (map.get(periodKey) ?? 0) + t.amountPaid);
  }
  return [...map.entries()]
    .map(([periodKey, inflow]) => ({ periodKey, inflow }))
    .sort((a, b) => a.periodKey.localeCompare(b.periodKey));
}

export function buildRestaurantExecutiveKpis(
  txs: RestaurantTransaction[],
  legacyHitos: HitoObra[]
): RestaurantExecutiveKpis {
  const counterparties = new Set(txs.map((t) => t.counterpartyName).filter(Boolean));
  const owners = new Set(txs.map((t) => t.ownerLabel).filter(Boolean));

  const supplierPaymentsTotal = txs
    .filter((t) => t.kind === "supplier_payment")
    .reduce((a, t) => a + t.amountPaid, 0);
  const cashInflowsTotal = txs
    .filter((t) => t.kind === "cash_inflow")
    .reduce((a, t) => a + t.amountPaid, 0);

  const hitosPendientes = legacyHitos.filter((h) => h.estado.toLowerCase().includes("pendiente")).length;
  const hitosEnCurso = legacyHitos.filter((h) => h.estado.toLowerCase().includes("curso")).length;
  const hitosHechos = legacyHitos.filter((h) => h.estado.toLowerCase().includes("hecho")).length;
  const avgProgress =
    legacyHitos.length === 0
      ? 0
      : legacyHitos.reduce((a, h) => a + h.avancePorcentaje, 0) / legacyHitos.length;

  const expensePaidTotal = sumBy(
    txs.filter((t) => t.kind !== "cash_inflow"),
    (t) => t.amountPaid
  );

  return {
    outflowPaidTotal: sumBy(txs, (t) => t.amountPaid),
    expensePaidTotal,
    commitmentsTotal: sumBy(txs, (t) => t.amountCommitted),
    openPayablesTotal: sumBy(txs, (t) => t.openBalance),
    transactionCount: txs.length,
    uniqueCounterparties: counterparties.size,
    uniqueOwners: owners.size,
    supplierPaymentsTotal,
    cashInflowsTotal,
    operationsTasksOpen: hitosPendientes,
    operationsTasksInProgress: hitosEnCurso,
    operationsTasksDone: hitosHechos,
    averageTaskProgressPercent: avgProgress
  };
}
