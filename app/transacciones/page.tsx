import Link from "next/link";
import { getDataSource } from "@/lib/data/factory";
import { getTransacciones } from "@/lib/data/transacciones-service";
import { formatCompactCurrency } from "@/lib/formatters";
import type { DashboardFiltros } from "@/types/domain";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function q(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function TransaccionesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const source = getDataSource();
  const catalogos = await source.getCatalogos();

  const filtros: DashboardFiltros = {
    fechaDesde: q(params, "fechaDesde"),
    fechaHasta: q(params, "fechaHasta"),
    categoria: q(params, "categoria"),
    responsable: q(params, "responsable"),
    estadoPago: q(params, "estadoPago"),
    etapaObra: q(params, "etapaObra")
  };

  const page = Number(q(params, "page") ?? "1");
  const search = q(params, "search") ?? "";

  const data = await getTransacciones({
    ...filtros,
    page,
    search
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <p className="text-sm text-muted">Listado completo con filtros, busqueda y paginacion</p>
      </header>

      <form className="panel grid gap-3 p-4 md:grid-cols-6">
        <input
          type="text"
          name="search"
          placeholder="Buscar por tercero, descripcion o ID"
          defaultValue={search}
          className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm md:col-span-2"
        />
        <select name="categoria" defaultValue={filtros.categoria} className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm">
          <option value="">Categoria</option>
          {catalogos.categorias.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select name="responsable" defaultValue={filtros.responsable} className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm">
          <option value="">Responsable</option>
          {catalogos.responsables.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select name="estadoPago" defaultValue={filtros.estadoPago} className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm">
          <option value="">Estado</option>
          {catalogos.estadosPago.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-bg">
          Filtrar
        </button>
      </form>

      <section className="panel overflow-x-auto p-4">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-2">Fecha</th>
              <th className="py-2">ID</th>
              <th className="py-2">Categoria</th>
              <th className="py-2">Tercero</th>
              <th className="py-2">Responsable</th>
              <th className="py-2">Comprometido</th>
              <th className="py-2">Pagado</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Soporte</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((tx) => (
              <tr key={tx.id} className="border-t border-line">
                <td className="py-2">{tx.fecha?.toLocaleDateString("es-PA") ?? "-"}</td>
                <td className="py-2">{tx.id}</td>
                <td className="py-2">{tx.categoria}</td>
                <td className="py-2">{tx.tercero}</td>
                <td className="py-2">{tx.responsable}</td>
                <td className="py-2">{formatCompactCurrency(tx.valorComprometido)}</td>
                <td className="py-2">{formatCompactCurrency(tx.valorPagado)}</td>
                <td className="py-2">{tx.estadoPago}</td>
                <td className="py-2">
                  {tx.soporteUrl ? (
                    <a
                      href={tx.soporteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent underline"
                    >
                      Abrir
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex items-center justify-between text-sm text-muted">
        <p>
          Pagina {data.page} de {data.totalPages} ({data.total} resultados)
        </p>
        <div className="flex gap-2">
          <Link
            href={`/transacciones?page=${Math.max(1, data.page - 1)}`}
            className="rounded-lg border border-line px-3 py-1"
          >
            Anterior
          </Link>
          <Link
            href={`/transacciones?page=${Math.min(data.totalPages, data.page + 1)}`}
            className="rounded-lg border border-line px-3 py-1"
          >
            Siguiente
          </Link>
        </div>
      </div>
    </div>
  );
}
