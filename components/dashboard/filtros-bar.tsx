import type { Catalogos, DashboardFiltros } from "@/types/domain";

interface FiltrosBarProps {
  filtros: DashboardFiltros;
  catalogos: Catalogos;
}

export function FiltrosBar({ filtros, catalogos }: FiltrosBarProps) {
  return (
    <form className="panel grid gap-3 p-4 md:grid-cols-6">
      <input
        type="date"
        name="fechaDesde"
        defaultValue={filtros.fechaDesde}
        className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm"
      />
      <input
        type="date"
        name="fechaHasta"
        defaultValue={filtros.fechaHasta}
        className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm"
      />
      <select
        name="categoria"
        defaultValue={filtros.categoria}
        className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm"
      >
        <option value="">Categoria</option>
        {catalogos.categorias.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        name="responsable"
        defaultValue={filtros.responsable}
        className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm"
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
        className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm"
      >
        <option value="">Estado de pago</option>
        {catalogos.estadosPago.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
      >
        Aplicar filtros
      </button>
    </form>
  );
}
