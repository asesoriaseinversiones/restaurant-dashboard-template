import { getDataSource } from "@/lib/data/factory";
import { buildRestaurantAlerts } from "@/lib/data/restaurant-alerts";
import { buildRestaurantMetrics } from "@/lib/data/restaurant-metrics";
import {
  buildExpenseSpendingByMonth,
  buildPayableSummaries,
  buildRestaurantExecutiveKpis,
  buildSalesByMonth,
  buildSpendingByMonth,
  groupPaidBy,
  mapBaseTransaccionToRestaurantTransaction,
  mapHitoObraToOperationalTask,
  mapPresupuestoItemToBudgetLine
} from "@/lib/data/mappers/legacy-to-restaurant";
import type { DashboardFiltros } from "@/types/domain";
import type { RestaurantExecutiveView, RestaurantTransaction } from "@/lib/types/restaurant";

const RECENT_LIMIT = 20;

function sortRecent(a: RestaurantTransaction, b: RestaurantTransaction): number {
  return (b.occurredOn?.getTime() ?? 0) - (a.occurredOn?.getTime() ?? 0);
}

/**
 * Executive restaurant metrics façade.
 * Uses the same `getDataSource()` pipeline as `getDashboardData` — no CSV or parser changes.
 */
export async function getRestaurantExecutiveView(
  filtros?: DashboardFiltros
): Promise<RestaurantExecutiveView> {
  const source = getDataSource();
  const [legacyTx, presupuesto, hitos] = await Promise.all([
    source.getBaseTransacciones(filtros),
    source.getPresupuesto(),
    source.getHitosObra()
  ]);

  const transactions = legacyTx.map(mapBaseTransaccionToRestaurantTransaction);
  const recentTransactions = [...transactions].sort(sortRecent).slice(0, RECENT_LIMIT);
  const metrics = buildRestaurantMetrics(transactions);

  const base: Omit<RestaurantExecutiveView, "alerts"> = {
    kpis: buildRestaurantExecutiveKpis(transactions, hitos),
    metrics,
    salesByMonth: buildSalesByMonth(transactions),
    spendingByMonth: buildSpendingByMonth(transactions),
    expenseSpendingByMonth: buildExpenseSpendingByMonth(transactions),
    paidOutByCategory: groupPaidBy(transactions, (t) => t.category),
    expensePaidByCategory: groupPaidBy(
      transactions.filter((t) => t.kind !== "cash_inflow"),
      (t) => t.category
    ),
    paidOutByOwner: groupPaidBy(transactions, (t) => t.ownerLabel),
    payables: buildPayableSummaries(legacyTx),
    budgetLines: presupuesto.map(mapPresupuestoItemToBudgetLine),
    operationalTasks: hitos.map((h, i) => mapHitoObraToOperationalTask(h, i)),
    recentTransactions,
    appliedFilters: { ...(filtros ?? {}) }
  };

  return {
    ...base,
    alerts: buildRestaurantAlerts(base, legacyTx)
  };
}
