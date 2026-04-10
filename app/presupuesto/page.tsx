import { hasPublicCsvConfig } from "@/config/env";
import { DataAvailabilityBanner } from "@/components/data-availability-banner";
import { getDataSource } from "@/lib/data/factory";
import { formatCompactCurrency, formatPercent } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function PresupuestoPage() {
  const configured = hasPublicCsvConfig();
  const source = getDataSource();
  const rows = await source.getPresupuesto();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Presupuesto</h1>
        <p className="text-sm text-muted">Control por categoria con alertas de ejecucion</p>
        <DataAvailabilityBanner
          missingConfig={!configured}
          emptyDataset={configured && rows.length === 0}
        />
      </header>

      <section className="panel overflow-x-auto p-4">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-2">Categoria</th>
              <th className="py-2">Presupuesto</th>
              <th className="py-2">Ejecutado</th>
              <th className="py-2">Saldo</th>
              <th className="py-2">% ejecutado</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="border-t border-line">
                <td className="py-6 text-center text-muted" colSpan={6}>
                  No hay líneas de presupuesto para mostrar.
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const isOver = item.ejecutadoCop > item.presupuestoCop;
                const isNear = !isOver && item.porcentajeEjecutado >= 85;
                const badgeClass = isOver
                  ? "bg-danger/20 text-danger"
                  : isNear
                    ? "bg-warning/20 text-warning"
                    : "bg-success/20 text-success";

                return (
                  <tr key={item.categoria} className="border-t border-line">
                    <td className="py-2">{item.categoria}</td>
                    <td className="py-2">{formatCompactCurrency(item.presupuestoCop)}</td>
                    <td className="py-2">{formatCompactCurrency(item.ejecutadoCop)}</td>
                    <td className="py-2">{formatCompactCurrency(item.saldoVsPresupuesto)}</td>
                    <td className="py-2">{formatPercent(item.porcentajeEjecutado)}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${badgeClass}`}>
                        {isOver ? "Excedido" : isNear ? "Cerca del limite" : "Controlado"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
