import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getDataSource } from "@/lib/data/factory";
import { getRestaurantExecutiveView } from "@/lib/data/restaurant-dashboard-facade";
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/formatters";
import type { DashboardFiltros } from "@/types/domain";
import type {
  PeriodCashflowSlice,
  RestaurantTransactionKind,
  SalesMonthSlice
} from "@/lib/types/restaurant";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function q(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function periodChipLabel(f: DashboardFiltros): string {
  const parts: string[] = [];
  if (f.mes) parts.push(`Mes ${f.mes}`);
  if (f.fechaDesde && f.fechaHasta) parts.push(`${f.fechaDesde} — ${f.fechaHasta}`);
  else if (f.fechaDesde) parts.push(`Desde ${f.fechaDesde}`);
  else if (f.fechaHasta) parts.push(`Hasta ${f.fechaHasta}`);
  if (f.sede) parts.push(`Sede: ${f.sede}`);
  if (f.canal) parts.push(`Canal: ${f.canal}`);
  if (parts.length === 0) return "Vista consolidada";
  return parts.join(" · ");
}

function kindLabel(kind: RestaurantTransactionKind): string {
  switch (kind) {
    case "cash_inflow":
      return "Ingreso caja";
    case "supplier_payment":
      return "Pago proveedor";
    case "commitment":
      return "Compromiso";
    default:
      return "Otro";
  }
}

function tailMonths<T extends { periodKey: string }>(rows: T[], n: number): T[] {
  return rows.length <= n ? rows : rows.slice(-n);
}

function barHeightPx(value: number, max: number, capPx: number): number {
  if (max <= 0) return 0;
  return Math.max(4, (value / max) * capPx);
}

function monthLabel(periodKey: string): string {
  if (periodKey === "Sin fecha") return "s/f";
  const d = new Date(`${periodKey}-01T12:00:00`);
  if (Number.isNaN(d.getTime())) return periodKey;
  return format(d, "MMM yy", { locale: es });
}

function dualMonthBars(
  slices: PeriodCashflowSlice[],
  maxPaid: number,
  maxCommitted: number
) {
  return slices.map((row, index) => {
    const hPaid = barHeightPx(row.paidOut, maxPaid, 130);
    const hCom = barHeightPx(row.committed, maxCommitted, 70);
    const isLast = index === slices.length - 1;
    return (
      <div key={row.periodKey} className="flex flex-1 flex-col items-center gap-1">
        <div className="flex h-[200px] w-full items-end justify-center gap-1">
          <div
            className={`w-[42%] max-w-[28px] rounded-t-[6px] ${
              isLast
                ? "bg-[linear-gradient(180deg,#8BB8FF_0%,#3B82F6_100%)]"
                : "bg-[linear-gradient(180deg,#4F8CFF_0%,#2563EB_100%)]"
            }`}
            style={{ height: `${hPaid}px` }}
            title={`Pagado ${formatCompactCurrency(row.paidOut)}`}
          />
          <div
            className="w-[42%] max-w-[28px] rounded-t-[6px] bg-[linear-gradient(180deg,#BFDBFE_0%,#93C5FD_100%)]"
            style={{ height: `${hCom}px` }}
            title={`Comprometido ${formatCompactCurrency(row.committed)}`}
          />
        </div>
        <div className="text-center text-xs text-[#64748B]">{monthLabel(row.periodKey)}</div>
      </div>
    );
  });
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filtros: DashboardFiltros = {
    fechaDesde: q(params, "fechaDesde"),
    fechaHasta: q(params, "fechaHasta"),
    mes: q(params, "mes"),
    categoria: q(params, "categoria"),
    responsable: q(params, "responsable"),
    estadoPago: q(params, "estadoPago"),
    etapaObra: q(params, "etapaObra"),
    sede: q(params, "sede"),
    canal: q(params, "canal")
  };

  const source = getDataSource();
  const [catalogos, view] = await Promise.all([
    source.getCatalogos(),
    getRestaurantExecutiveView(filtros)
  ]);

  const { kpis, metrics: m } = view;
  const netFlow = kpis.cashInflowsTotal - kpis.expensePaidTotal;

  const execKpis = [
    { label: "INGRESOS (CAJA)", value: formatCompactCurrency(kpis.cashInflowsTotal), icon: "◌" },
    { label: "GASTOS PAGADOS", value: formatCompactCurrency(kpis.expensePaidTotal), icon: "↗" },
    { label: "SALDO ABIERTO", value: formatCompactCurrency(kpis.openPayablesTotal), icon: "↑" },
    { label: "FLUJO NETO (EST.)", value: formatCompactCurrency(netFlow), icon: "↗" }
  ];

  const salesMonths = tailMonths(view.salesByMonth, 12);
  const maxInflow = Math.max(...salesMonths.map((s: SalesMonthSlice) => s.inflow), 1);

  const expenseMonths = tailMonths(view.expenseSpendingByMonth, 12);
  const maxExpPaid = Math.max(...expenseMonths.map((s) => s.paidOut), 1);
  const maxExpCom = Math.max(...expenseMonths.map((s) => s.committed), 1);

  const topExpenseCategories = [...view.expensePaidByCategory]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const budgetForBars = [...view.budgetLines]
    .sort((a, b) => b.percentUtilized - a.percentUtilized)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FBFF_0%,#EEF4FF_100%)] p-4 md:p-8">
      <section className="mx-auto max-w-7xl rounded-[28px] border border-[#C7D7F4] bg-[linear-gradient(180deg,#FFFFFF_0%,#F3F7FF_100%)] p-6 text-[#0F172A] shadow-[0_20px_60px_rgba(37,99,235,0.08)] md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Dashboard ejecutivo
          </h1>
          <p className="mt-2 text-sm text-[#5B6F95]">Restaurante · vista financiera y operativa</p>
        </div>

        <div className="rounded-[24px] border border-[#D7E3F8] bg-[linear-gradient(180deg,#F8FBFF_0%,#EEF4FF_100%)] p-5 md:p-8">
          {/* Executive Summary */}
          <h2 className="mb-4 text-2xl font-semibold text-[#0F172A]">
            <span className="font-bold">Resumen</span>{" "}
            <span className="text-[#5B6F95]">ejecutivo</span>
          </h2>

          <form
            method="get"
            action="/"
            className="mb-8 space-y-3 rounded-[20px] border border-[#D7E3F8] bg-white p-4 md:p-5"
          >
            <div className="grid gap-3 md:grid-cols-6">
              <input
                type="date"
                name="fechaDesde"
                defaultValue={filtros.fechaDesde}
                className="rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]"
              />
              <input
                type="date"
                name="fechaHasta"
                defaultValue={filtros.fechaHasta}
                className="rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]"
              />
              <input
                type="month"
                name="mes"
                defaultValue={filtros.mes ?? ""}
                className="rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]"
              />
              {catalogos.sedes.length > 0 ? (
                <select
                  name="sede"
                  defaultValue={filtros.sede}
                  className="rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]"
                >
                  <option value="">Todas las sedes</option>
                  {catalogos.sedes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : null}
              {catalogos.canales.length > 0 ? (
                <select
                  name="canal"
                  defaultValue={filtros.canal}
                  className="rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]"
                >
                  <option value="">Todos los canales</option>
                  {catalogos.canales.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-6">
              <select
                name="categoria"
                defaultValue={filtros.categoria}
                className="rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]"
              >
                <option value="">Categoría</option>
                {catalogos.categorias.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                name="responsable"
                defaultValue={filtros.responsable}
                className="rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]"
              >
                <option value="">Responsable</option>
                {catalogos.responsables.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                name="estadoPago"
                defaultValue={filtros.estadoPago}
                className="rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]"
              >
                <option value="">Estado de pago</option>
                {catalogos.estadosPago.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                name="etapaObra"
                defaultValue={filtros.etapaObra}
                className="rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]"
              >
                <option value="">Etapa obra</option>
                {catalogos.etapasObra.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-[linear-gradient(90deg,#2563EB_0%,#60A5FA_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] md:col-span-2"
              >
                Aplicar filtros
              </button>
            </div>
          </form>

          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#D7E3F8] bg-white px-5 py-3 text-sm text-[#5B6F95]">
            <span className="text-base">◷</span>
            <span>{periodChipLabel(filtros)}</span>
          </div>

          <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {execKpis.map((item) => (
              <div
                key={item.label}
                className="rounded-[20px] border border-[#D7E3F8] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(37,99,235,0.06)]"
              >
                <div className="mb-3 flex items-center gap-2 text-sm tracking-[0.08em] text-[#6B7EA5]">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <div className="text-4xl font-semibold tracking-tight text-[#0F172A]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-10 space-y-4 border-b border-[#D7E3F8] pb-8 text-lg leading-relaxed text-[#475569]">
            <p>
              Ingresos por abonos/caja:{" "}
              <span className="font-semibold text-[#0F172A]">
                {formatCurrency(kpis.cashInflowsTotal)}
              </span>
              . Pagos de egresos:{" "}
              <span className="font-semibold text-[#0F172A]">
                {formatCurrency(kpis.expensePaidTotal)}
              </span>
              .
            </p>
            <p>
              Compromisos registrados:{" "}
              <span className="font-semibold text-[#0F172A]">
                {formatCurrency(kpis.commitmentsTotal)}
              </span>
              . Proveedores con saldo:{" "}
              <span className="font-semibold text-[#0F172A]">{view.payables.length}</span> · Hitos
              abiertos/en curso:{" "}
              <span className="font-semibold text-[#0F172A]">
                {kpis.operationsTasksOpen + kpis.operationsTasksInProgress}
              </span>
              .
            </p>
          </div>

          <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">Indicadores de negocio</h3>
          <p className="mb-4 text-xs text-[#64748B]">
            Porcentajes sobre ingresos de caja del periodo. Food cost y nómina se estiman por palabras clave en
            categoría / subcategoría / descripción.
          </p>
          <div className="mb-10 overflow-hidden rounded-[16px] border border-[#D7E3F8]">
            <table className="w-full text-left text-sm">
              <tbody className="text-[#334155]">
                <tr className="border-b border-[#D7E3F8]">
                  <td className="px-4 py-3 font-medium text-[#6B7EA5]">Food cost (est.)</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                    {m.foodCostPercentOfSales === null ? "—" : formatPercent(m.foodCostPercentOfSales)}
                  </td>
                </tr>
                <tr className="border-b border-[#D7E3F8]">
                  <td className="px-4 py-3 font-medium text-[#6B7EA5]">Nómina / ventas (est.)</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                    {m.payrollPercentOfSales === null ? "—" : formatPercent(m.payrollPercentOfSales)}
                  </td>
                </tr>
                <tr className="border-b border-[#D7E3F8]">
                  <td className="px-4 py-3 font-medium text-[#6B7EA5]">Margen bruto aprox.</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                    {m.grossMarginPercent === null ? "—" : formatPercent(m.grossMarginPercent)}
                  </td>
                </tr>
                <tr className="border-b border-[#D7E3F8]">
                  <td className="px-4 py-3 font-medium text-[#6B7EA5]">Margen operativo aprox.</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                    {m.operatingMarginPercent === null ? "—" : formatPercent(m.operatingMarginPercent)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#6B7EA5]">Punto de equilibrio (est.)</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                    {m.breakEvenSalesApprox === null
                      ? "—"
                      : formatCompactCurrency(m.breakEvenSalesApprox)}
                  </td>
                </tr>
              </tbody>
            </table>
            {m.breakEvenBasisNote ? (
              <p className="border-t border-[#D7E3F8] px-4 py-3 text-xs text-[#64748B]">
                {m.breakEvenBasisNote}
              </p>
            ) : null}
          </div>

          {/* Sales */}
          <h2 className="mb-5 text-2xl font-semibold text-[#0F172A]">
            <span className="font-bold">Ventas</span>{" "}
            <span className="text-[#5B6F95]">(caja / abonos por mes)</span>
          </h2>
          <div className="mb-10">
            {salesMonths.length === 0 ? (
              <p className="text-sm text-[#64748B]">Sin ingresos de caja en el periodo filtrado.</p>
            ) : (
              <div className="flex h-[220px] items-end gap-2 md:gap-3">
                {salesMonths.map((bar, index) => (
                  <div key={bar.periodKey} className="flex flex-1 flex-col items-center">
                    <div
                      className={`w-full rounded-t-[8px] ${
                        index === salesMonths.length - 1
                          ? "bg-[linear-gradient(180deg,#8BB8FF_0%,#3B82F6_100%)]"
                          : "bg-[linear-gradient(180deg,#4F8CFF_0%,#2563EB_100%)]"
                      }`}
                      style={{ height: `${barHeightPx(bar.inflow, maxInflow, 150)}px` }}
                    />
                    <div className="mt-3 text-xs text-[#64748B]">{monthLabel(bar.periodKey)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses */}
          <h2 className="mb-5 text-2xl font-semibold text-[#0F172A]">
            <span className="font-bold">Gastos</span>{" "}
            <span className="text-[#5B6F95]">pagado y comprometido</span>
          </h2>
          <div className="mb-10 grid gap-8 xl:grid-cols-2">
            <div>
              <p className="mb-3 text-sm text-[#64748B]">
                Barras: pagado (azul fuerte) · comprometido (azul claro)
              </p>
              {expenseMonths.length === 0 ? (
                <p className="text-sm text-[#64748B]">Sin egresos en el periodo filtrado.</p>
              ) : (
                <div className="flex items-end gap-2 md:gap-3">{dualMonthBars(expenseMonths, maxExpPaid, maxExpCom)}</div>
              )}
            </div>
            <div>
              <div className="overflow-hidden rounded-[16px] border border-[#D7E3F8]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-transparent text-[#6B7EA5]">
                    <tr className="border-b border-[#D7E3F8]">
                      <th className="px-4 py-4 font-medium">Categoría</th>
                      <th className="px-4 py-4 font-medium text-right">Pagado</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg text-[#334155]">
                    {topExpenseCategories.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-sm text-[#64748B]" colSpan={2}>
                          Sin categorías con pagos en este periodo.
                        </td>
                      </tr>
                    ) : (
                      topExpenseCategories.map((row) => (
                        <tr key={row.key} className="border-b border-[#D7E3F8] last:border-b-0">
                          <td className="px-4 py-4 font-semibold text-[#0F172A]">{row.key}</td>
                          <td className="px-4 py-4 text-right">{formatCompactCurrency(row.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Profitability */}
          <h2 className="mb-5 text-2xl font-semibold text-[#0F172A]">
            <span className="font-bold">Rentabilidad</span>{" "}
            <span className="text-[#5B6F95]">presupuesto y márgenes</span>
          </h2>
          <div className="mb-10 grid gap-8 xl:grid-cols-2">
            <div>
              <div className="overflow-hidden rounded-[16px] border border-[#D7E3F8]">
                <table className="w-full text-left text-sm">
                  <thead className="text-[#6B7EA5]">
                    <tr className="border-b border-[#D7E3F8]">
                      <th className="px-4 py-4 font-medium">Rubro</th>
                      <th className="px-4 py-4 font-medium text-right">Presupuesto</th>
                      <th className="px-4 py-4 font-medium text-right">Ejecutado</th>
                      <th className="px-4 py-4 font-medium text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg text-[#334155]">
                    {view.budgetLines.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-sm text-[#64748B]" colSpan={4}>
                          Sin líneas de presupuesto cargadas.
                        </td>
                      </tr>
                    ) : (
                      view.budgetLines.map((row) => (
                        <tr key={row.categoryKey} className="border-b border-[#D7E3F8] last:border-b-0">
                          <td className="px-4 py-4 font-semibold text-[#0F172A]">{row.categoryKey}</td>
                          <td className="px-4 py-4 text-right">
                            {formatCompactCurrency(row.budgetAmount)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {formatCompactCurrency(row.actualAmount)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {formatPercent(row.percentUtilized)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p className="mb-4 text-sm text-[#64748B]">
                Margen operativo (misma base que tabla superior):{" "}
                <span className="font-semibold text-[#0F172A]">
                  {m.operatingMarginPercent === null ? "—" : formatPercent(m.operatingMarginPercent)}
                </span>
              </p>
              <h3 className="mb-4 text-lg font-semibold text-[#0F172A]">
                Uso de presupuesto por rubro
              </h3>
              <div className="space-y-6">
                {budgetForBars.length === 0 ? (
                  <p className="text-sm text-[#64748B]">Sin datos de presupuesto.</p>
                ) : (
                  budgetForBars.map((item) => (
                    <div key={item.categoryKey}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-[#6B7EA5]">{item.categoryKey}</span>
                        <span className="text-[#5B6F95]">{formatPercent(item.percentUtilized)}</span>
                      </div>
                      <div className="h-5 overflow-hidden rounded-full bg-[#DCE8FF]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#2563EB_0%,#60A5FA_100%)]"
                          style={{ width: `${Math.min(100, item.percentUtilized)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Operations */}
          <h2 className="mb-5 text-2xl font-semibold text-[#0F172A]">
            <span className="font-bold">Operaciones</span>{" "}
            <span className="text-[#5B6F95]">hitos de obra</span>
          </h2>
          <div className="mb-10 overflow-hidden rounded-[16px] border border-[#D7E3F8]">
            <table className="w-full text-left text-sm">
              <thead className="bg-transparent text-[#6B7EA5]">
                <tr className="border-b border-[#D7E3F8]">
                  <th className="px-4 py-4 font-medium">Área</th>
                  <th className="px-4 py-4 font-medium">Tarea</th>
                  <th className="px-4 py-4 font-medium">Responsable</th>
                  <th className="px-4 py-4 font-medium">Estado</th>
                  <th className="px-4 py-4 font-medium text-right">Avance</th>
                  <th className="px-4 py-4 font-medium">Vence</th>
                </tr>
              </thead>
              <tbody className="text-[#334155]">
                {view.operationalTasks.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-sm text-[#64748B]" colSpan={6}>
                      Sin hitos registrados.
                    </td>
                  </tr>
                ) : (
                  view.operationalTasks.map((task) => (
                    <tr key={task.id} className="border-b border-[#D7E3F8] last:border-b-0">
                      <td className="px-4 py-4 font-semibold text-[#0F172A]">{task.area}</td>
                      <td className="px-4 py-4">{task.title}</td>
                      <td className="px-4 py-4">{task.assignee}</td>
                      <td className="px-4 py-4">{task.statusLabel}</td>
                      <td className="px-4 py-4 text-right">{formatPercent(task.progressPercent)}</td>
                      <td className="px-4 py-4 text-sm">
                        {task.dueOn
                          ? format(task.dueOn, "d MMM yyyy", { locale: es })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h2 className="mb-5 text-2xl font-semibold text-[#0F172A]">
            <span className="font-bold">Actividad</span>{" "}
            <span className="text-[#5B6F95]">reciente</span>
          </h2>
          <div className="mb-10 overflow-hidden rounded-[16px] border border-[#D7E3F8]">
            <table className="w-full text-left text-sm">
              <thead className="bg-transparent text-[#6B7EA5]">
                <tr className="border-b border-[#D7E3F8]">
                  <th className="px-4 py-4 font-medium">Fecha</th>
                  <th className="px-4 py-4 font-medium">Tipo</th>
                  <th className="px-4 py-4 font-medium">Categoría</th>
                  <th className="px-4 py-4 font-medium">Tercero</th>
                  <th className="px-4 py-4 font-medium text-right">Pagado</th>
                  <th className="px-4 py-4 font-medium text-right">Saldo abierto</th>
                </tr>
              </thead>
              <tbody className="text-[#334155]">
                {view.recentTransactions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-sm text-[#64748B]" colSpan={6}>
                      Sin movimientos en el periodo filtrado.
                    </td>
                  </tr>
                ) : (
                  view.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-[#D7E3F8] last:border-b-0">
                      <td className="px-4 py-4 text-sm">
                        {tx.occurredOn
                          ? format(tx.occurredOn, "d MMM yyyy", { locale: es })
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm">{kindLabel(tx.kind)}</td>
                      <td className="px-4 py-4 font-semibold text-[#0F172A]">{tx.category}</td>
                      <td className="px-4 py-4">{tx.counterpartyName}</td>
                      <td className="px-4 py-4 text-right">{formatCompactCurrency(tx.amountPaid)}</td>
                      <td className="px-4 py-4 text-right">{formatCompactCurrency(tx.openBalance)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Alerts */}
          <div className="border-t border-[#D7E3F8] pt-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-4 w-4 rotate-45 bg-[#2563EB]" />
              <h2 className="text-2xl font-semibold text-[#0F172A]">Alertas</h2>
            </div>
            <div className="space-y-6 text-lg leading-relaxed text-[#475569]">
              {view.alerts.length === 0 ? (
                <p className="border-b border-[#D7E3F8] pb-5">Sin alertas prioritarias en esta vista.</p>
              ) : (
                view.alerts.map((a, i) => (
                  <p
                    key={`${a.title}-${i}`}
                    className="border-b border-[#D7E3F8] pb-5 last:mb-0 last:border-b-0 last:pb-0"
                  >
                    <span className="font-semibold text-[#0F172A]">
                      {a.severity === "critical" ? "Crítico: " : a.severity === "warning" ? "Atención: " : ""}
                      {a.title}
                    </span>
                    {a.detail ? (
                      <>
                        {" "}
                        <span className="text-[#64748B]">{a.detail}</span>
                      </>
                    ) : null}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
