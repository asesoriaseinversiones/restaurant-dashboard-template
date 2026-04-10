import { getDataSource } from "@/lib/data/factory";
import type { BaseTransaccion, DashboardFiltros } from "@/types/domain";

export interface TransaccionesQuery extends DashboardFiltros {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof BaseTransaccion;
  sortDir?: "asc" | "desc";
}

export async function getTransacciones(query: TransaccionesQuery) {
  const source = getDataSource();
  const rows = await source.getBaseTransacciones(query);
  const search = (query.search ?? "").toLowerCase().trim();
  let filtered = rows;

  if (search) {
    filtered = rows.filter((tx) =>
      [tx.id, tx.descripcion, tx.tercero, tx.categoria, tx.responsable]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  const sortBy = query.sortBy ?? "fecha";
  const sortDir = query.sortDir ?? "desc";

  filtered.sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }
    const as = String(av ?? "");
    const bs = String(bv ?? "");
    return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
  });

  const pageSize = query.pageSize ?? 15;
  const page = Math.max(1, query.page ?? 1);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    rows: filtered.slice(start, end)
  };
}
