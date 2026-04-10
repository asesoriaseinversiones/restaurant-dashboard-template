import { differenceInCalendarDays } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import type { BaseTransaccion } from "@/types/domain";
import type {
  PeriodCashflowSlice,
  RestaurantAlert,
  RestaurantExecutiveMetrics,
  RestaurantExecutiveView,
  SalesMonthSlice
} from "@/lib/types/restaurant";

const PAYABLE_OVERDUE_DAYS = 45;
const FOOD_COST_WARN_PCT = 32;
const FOOD_COST_CRIT_PCT = 38;
const PAYROLL_WARN_PCT = 32;
const PAYROLL_CRIT_PCT = 45;
const EXPENSE_SPIKE_RATIO = 1.55;
const SALES_DROP_RATIO = 0.88;

type ViewForAlerts = Omit<RestaurantExecutiveView, "alerts">;

export function buildRestaurantAlerts(view: ViewForAlerts, legacyTx: BaseTransaccion[]): RestaurantAlert[] {
  const alerts: RestaurantAlert[] = [];
  const {
    kpis,
    metrics,
    budgetLines,
    payables,
    operationalTasks,
    salesByMonth,
    expenseSpendingByMonth
  } = view;
  const now = Date.now();
  const today = new Date();

  const overdueOpen = legacyTx.filter(
    (t) =>
      t.saldoAbierto > 0 &&
      t.fecha instanceof Date &&
      !Number.isNaN(t.fecha.getTime()) &&
      differenceInCalendarDays(today, t.fecha) > PAYABLE_OVERDUE_DAYS
  );
  const overdueAmount = overdueOpen.reduce((a, t) => a + t.saldoAbierto, 0);
  const overdueParties = new Set(overdueOpen.map((t) => t.tercero.trim() || "Sin nombre")).size;

  if (overdueAmount > 0) {
    alerts.push({
      severity: "critical",
      title: "Cuentas por pagar con antigüedad elevada",
      detail: `${formatCurrency(overdueAmount)} en saldo abierto (> ${PAYABLE_OVERDUE_DAYS} días, ${overdueParties} terceros)`
    });
  } else if (kpis.openPayablesTotal > 0) {
    alerts.push({
      severity: "warning",
      title: "Saldo abierto por pagar",
      detail: formatCurrency(kpis.openPayablesTotal)
    });
  }

  for (const line of budgetLines) {
    if (line.percentUtilized > 100) {
      alerts.push({
        severity: "critical",
        title: `Presupuesto superado: ${line.categoryKey}`,
        detail: `${line.percentUtilized.toFixed(0)}% ejecutado`
      });
    } else if (line.percentUtilized >= 85) {
      alerts.push({
        severity: "warning",
        title: `Cerca del tope presupuestal: ${line.categoryKey}`,
        detail: `${line.percentUtilized.toFixed(0)}% utilizado`
      });
    }
  }

  alertSalesTrend(salesByMonth, alerts);
  alertExpenseSpike(expenseSpendingByMonth, alerts);
  alertFoodAndPayroll(metrics, alerts);

  for (const task of operationalTasks) {
    const done = task.statusLabel.toLowerCase().includes("hecho");
    if (task.dueOn && task.dueOn.getTime() < now && !done) {
      alerts.push({
        severity: "warning",
        title: `Hito vencido: ${task.title}`,
        detail: `${task.area} · ${task.assignee}`
      });
    }
    if (task.health === "red" && !done) {
      alerts.push({
        severity: "critical",
        title: `Semáforo rojo: ${task.title}`,
        detail: task.area
      });
    }
  }

  if (payables.length > 5 && overdueAmount <= 0) {
    alerts.push({
      severity: "info",
      title: "Múltiples cuentas por pagar",
      detail: `${payables.length} proveedores con saldo abierto`
    });
  }

  return alerts;
}

function alertSalesTrend(salesByMonth: SalesMonthSlice[], alerts: RestaurantAlert[]) {
  if (salesByMonth.length < 2) return;
  const sorted = [...salesByMonth].sort((a, b) => a.periodKey.localeCompare(b.periodKey));
  const last = sorted[sorted.length - 1]?.inflow ?? 0;
  const prev = sorted[sorted.length - 2]?.inflow ?? 0;
  if (prev <= 0 || last <= 0) return;
  if (last < prev * SALES_DROP_RATIO) {
    alerts.push({
      severity: "warning",
      title: "Tendencia de ventas (caja) a la baja",
      detail: `Último mes vs anterior: ${formatCurrency(last)} vs ${formatCurrency(prev)}`
    });
  }
}

function alertExpenseSpike(expenseSpendingByMonth: PeriodCashflowSlice[], alerts: RestaurantAlert[]) {
  if (expenseSpendingByMonth.length < 4) return;
  const sorted = [...expenseSpendingByMonth].sort((a, b) => a.periodKey.localeCompare(b.periodKey));
  const last = sorted[sorted.length - 1];
  const prev = sorted.slice(-4, -1);
  const avg = prev.reduce((a, s) => a + s.paidOut, 0) / prev.length;
  if (avg <= 0) return;
  if (last.paidOut > avg * EXPENSE_SPIKE_RATIO) {
    alerts.push({
      severity: "warning",
      title: "Pico inusual en egresos pagados",
      detail: `${monthKeyLabel(last.periodKey)}: ${formatCurrency(last.paidOut)} vs promedio previo ${formatCurrency(avg)}`
    });
  }
}

function monthKeyLabel(periodKey: string): string {
  return periodKey === "Sin fecha" ? periodKey : periodKey;
}

function alertFoodAndPayroll(metrics: RestaurantExecutiveMetrics, alerts: RestaurantAlert[]) {
  const f = metrics.foodCostPercentOfSales;
  if (f !== null) {
    if (f >= FOOD_COST_CRIT_PCT) {
      alerts.push({
        severity: "critical",
        title: "Food cost estimado elevado",
        detail: `${f.toFixed(1)}% sobre ingresos de caja (heurística por categorías)`
      });
    } else if (f >= FOOD_COST_WARN_PCT) {
      alerts.push({
        severity: "warning",
        title: "Food cost estimado alto",
        detail: `${f.toFixed(1)}% sobre ingresos de caja`
      });
    }
  }

  const p = metrics.payrollPercentOfSales;
  if (p !== null) {
    if (p >= PAYROLL_CRIT_PCT) {
      alerts.push({
        severity: "critical",
        title: "Ratio nómina / ventas estimado elevado",
        detail: `${p.toFixed(1)}% (heurística por texto en categoría/descripción)`
      });
    } else if (p >= PAYROLL_WARN_PCT) {
      alerts.push({
        severity: "warning",
        title: "Ratio nómina / ventas estimado alto",
        detail: `${p.toFixed(1)}%`
      });
    }
  }
}
