import type { BaseTransaccion, DashboardFiltros } from "@/types/domain";

/**
 * Restaurant / hospitality product domain (Phase 1).
 * Legacy rows stay on `legacy` for traceability; CSV columns unchanged.
 */

export type RestaurantTransactionKind =
  | "supplier_payment"
  | "cash_inflow"
  | "commitment"
  | "other";

export interface RestaurantTransaction {
  id: string;
  occurredOn: Date | null;
  kind: RestaurantTransactionKind;
  category: string;
  subcategory: string;
  counterpartyName: string;
  description: string;
  ownerLabel: string;
  amountPaid: number;
  amountCommitted: number;
  openBalance: number;
  paymentStatus: string;
  opsStageLabel: string;
  sourceLabel: string;
  reconciled: boolean;
  supportUrl?: string;
  notes?: string;
  /** Multi-location: null until source adds a venue column */
  venueId: string | null;
  /** Channel / revenue stream: null until source provides it */
  channel: string | null;
  legacy: BaseTransaccion;
}

export interface PayableSummary {
  counterpartyName: string;
  openAmount: number;
  lineCount: number;
}

export interface BudgetLine {
  categoryKey: string;
  budgetAmount: number;
  actualAmount: number;
  varianceToBudget: number;
  percentUtilized: number;
}

export type OperationalHealth = "green" | "yellow" | "red" | "neutral";

export interface OperationalTask {
  id: string;
  area: string;
  title: string;
  assignee: string;
  startsOn: Date | null;
  dueOn: Date | null;
  statusLabel: string;
  progressPercent: number;
  health: OperationalHealth;
  notes?: string;
}

export interface RestaurantExecutiveKpis {
  /** Sum of `amountPaid` on all rows (incl. abonos caja). */
  outflowPaidTotal: number;
  /** Paid amounts excluding `cash_inflow` (gastos y otros egresos). */
  expensePaidTotal: number;
  commitmentsTotal: number;
  openPayablesTotal: number;
  transactionCount: number;
  uniqueCounterparties: number;
  uniqueOwners: number;
  supplierPaymentsTotal: number;
  cashInflowsTotal: number;
  operationsTasksOpen: number;
  operationsTasksInProgress: number;
  operationsTasksDone: number;
  averageTaskProgressPercent: number;
}

export interface PeriodCashflowSlice {
  periodKey: string;
  paidOut: number;
  committed: number;
}

/** Monthly cash inflows (abonos / caja), keyed yyyy-MM */
export interface SalesMonthSlice {
  periodKey: string;
  inflow: number;
}

export interface NamedAmount {
  key: string;
  amount: number;
}

export type RestaurantAlertSeverity = "info" | "warning" | "critical";

export interface RestaurantAlert {
  severity: RestaurantAlertSeverity;
  title: string;
  detail?: string;
}

export interface RestaurantExecutiveMetrics {
  foodCostPaid: number;
  payrollPaid: number;
  otherExpensePaid: number;
  cashInflowsTotal: number;
  expensePaidTotal: number;
  foodCostPercentOfSales: number | null;
  payrollPercentOfSales: number | null;
  grossMarginPercent: number | null;
  operatingMarginPercent: number | null;
  breakEvenSalesApprox: number | null;
  breakEvenBasisNote: string | null;
}

export interface RestaurantExecutiveView {
  kpis: RestaurantExecutiveKpis;
  metrics: RestaurantExecutiveMetrics;
  salesByMonth: SalesMonthSlice[];
  /** All movement by month (legacy-style). */
  spendingByMonth: PeriodCashflowSlice[];
  /** Egresos y compromisos by month (sin abonos caja). */
  expenseSpendingByMonth: PeriodCashflowSlice[];
  paidOutByCategory: NamedAmount[];
  /** Pagos por categoría excluyendo abonos caja. */
  expensePaidByCategory: NamedAmount[];
  paidOutByOwner: NamedAmount[];
  payables: PayableSummary[];
  budgetLines: BudgetLine[];
  operationalTasks: OperationalTask[];
  recentTransactions: RestaurantTransaction[];
  alerts: RestaurantAlert[];
  appliedFilters: DashboardFiltros;
}
