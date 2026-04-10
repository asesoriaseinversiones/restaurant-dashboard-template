import { getDataSource } from "@/lib/data/factory";
import { formatPercent } from "@/lib/formatters";

const semaforoColor: Record<string, string> = {
  verde: "bg-success/20 text-success",
  amarillo: "bg-warning/20 text-warning",
  rojo: "bg-danger/20 text-danger",
  gris: "bg-line text-muted"
};

export default async function HitosPage() {
  const source = getDataSource();
  const rows = await source.getHitosObra();

  const now = Date.now();
  const vencimientos = rows
    .filter((row) => row.fechaObjetivo && row.fechaObjetivo.getTime() >= now)
    .sort((a, b) => (a.fechaObjetivo?.getTime() ?? 0) - (b.fechaObjetivo?.getTime() ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Hitos de obra</h1>
        <p className="text-sm text-muted">Seguimiento de tareas, avance y semaforo operativo</p>
      </header>

      <section className="panel overflow-x-auto p-4">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-2">Frente</th>
              <th className="py-2">Tarea</th>
              <th className="py-2">Responsable</th>
              <th className="py-2">Inicio</th>
              <th className="py-2">Objetivo</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Avance</th>
              <th className="py-2">Semaforo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((hito) => (
              <tr key={`${hito.frente}-${hito.tarea}`} className="border-t border-line">
                <td className="py-2">{hito.frente}</td>
                <td className="py-2">{hito.tarea}</td>
                <td className="py-2">{hito.responsable}</td>
                <td className="py-2">{hito.fechaInicio?.toLocaleDateString("es-PA") ?? "-"}</td>
                <td className="py-2">{hito.fechaObjetivo?.toLocaleDateString("es-PA") ?? "-"}</td>
                <td className="py-2">{hito.estado}</td>
                <td className="py-2">{formatPercent(hito.avancePorcentaje)}</td>
                <td className="py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${semaforoColor[hito.semaforo] ?? semaforoColor.gris}`}
                  >
                    {hito.semaforo}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Proximos vencimientos
        </h2>
        <ul className="space-y-2 text-sm">
          {vencimientos.map((item) => (
            <li key={`${item.frente}-${item.tarea}`} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
              <span>
                {item.frente} - {item.tarea}
              </span>
              <span className="text-muted">{item.fechaObjetivo?.toLocaleDateString("es-PA")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
