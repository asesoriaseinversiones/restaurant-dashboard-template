import { useMemo } from "react";
import type { DashboardFiltros } from "@/types/domain";

export function useDashboardFilters(params: URLSearchParams): DashboardFiltros {
  return useMemo(
    () => ({
      fechaDesde: params.get("fechaDesde") ?? undefined,
      fechaHasta: params.get("fechaHasta") ?? undefined,
      mes: params.get("mes") ?? undefined,
      categoria: params.get("categoria") ?? undefined,
      responsable: params.get("responsable") ?? undefined,
      estadoPago: params.get("estadoPago") ?? undefined,
      etapaObra: params.get("etapaObra") ?? undefined,
      sede: params.get("sede") ?? undefined,
      canal: params.get("canal") ?? undefined
    }),
    [params]
  );
}
