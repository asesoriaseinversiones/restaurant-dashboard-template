import Link from "next/link";
import type { Route } from "next";
import { hasPublicCsvConfig } from "@/config/env";
import { DataAvailabilityBanner } from "@/components/data-availability-banner";
import { getDataSource } from "@/lib/data/factory";
import { getTransacciones } from "@/lib/data/transacciones-service";
import { formatCompactCurrency } from "@/lib/formatters";
import type { DashboardFiltros } from "@/types/domain";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function q(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function transaccionesHref(
  filtros: DashboardFiltros,
  search: string,
  page: number
): string {
  const u = new URLSearchParams();
  if (filtros.fechaDesde) u.set("fechaDesde", filtros.fechaDesde);
  if (filtros.fechaHasta) u.set("fechaHasta", filtros.fechaHasta);
  if (filtros.mes) u.set("mes", filtros.mes);
  if (filtros.categoria) u.set("categoria", filtros.categoria);
  if (filtros.responsable) u.set("responsable", filtros.responsable);
  if (filtros.estadoPago) u.set("estadoPago", filtros.estadoPago);
  if (filtros.etapaObra) u.set("etapaObra", filtros.etapaObra);
  if (filtros.sede) u.set("sede", filtros.sede);
  if (filtros.canal) u.set("canal", filtros.canal);
  if (search.trim()) u.set("search", search.trim());
  u.set("page", String(page));
  const qs = u.toString();
  return qs ? `/transacciones?${qs}` : `/transacciones?page=${page}`;
}

export default async function TransaccionesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const configured = hasPublicCsvConfig();
  const source = getDataSource();
  const catalogos = await source.getCatalogos();

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
        <DataAvailabilityBanner
          missingConfig={!configured}
          emptyDataset={configured && data.total === 0}
        />
      </header>

      <form className="panel grid gap-3 p-4 md:grid-cols-6">
        <input type="hidden" name="page" value="1" />
        <input
          type="text"
          name="search"
          placeholder="Buscar por tercero, descripcion o ID"
          defaultValue={search}
          className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm md:col-span-2"
        />
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
        <input
          type="month"
          name="mes"
          defaultValue={filtros.mes ?? ""}
          className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm"
        />
        {catalogos.sedes.length > 0 ? (
          <select name="sede" defaultValue={filtros.sede} className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm">
            <option value="">Sede</option>
            {catalogos.sedes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ) : null}
        {catalogos.canales.length > 0 ? (
          <select name="canal" defaultValue={filtros.canal} className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm">
            <option value="">Canal</option>
            {catalogos.canales.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ) : null}
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
        <select name="etapaObra" defaultValue={filtros.etapaObra} className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm">
          <option value="">Etapa obra</option>
          {catalogos.etapasObra.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-bg md:col-span-2">
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
            {data.rows.length === 0 ? (
              <tr className="border-t border-line">
                <td className="py-6 text-center text-muted" colSpan={9}>
                  No hay transacciones para mostrar.
                </td>
              </tr>
            ) : (
              data.rows.map((tx) => (
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
              ))
            )}
          </tbody>
        </table>
      </section>

      <div className="flex items-center justify-between text-sm text-muted">
        <p>
          Pagina {data.page} de {data.totalPages} ({data.total} resultados)
        </p>
        <div className="flex gap-2">
          <Link
            href={transaccionesHref(filtros, search, Math.max(1, data.page - 1)) as Route}
            className="rounded-lg border border-line px-3 py-1"
          >
            Anterior
          </Link>
          <Link
            href={transaccionesHref(filtros, search, Math.min(data.totalPages, data.page + 1)) as Route}
            className="rounded-lg border border-line px-3 py-1"
          >
            Siguiente
          </Link>
        </div>
      </div>
    </div>
  );
}
