type Props = {
  missingConfig: boolean;
  emptyDataset?: boolean;
};

/**
 * Avisos mínimos sin cambiar la paleta del dashboard.
 */
export function DataAvailabilityBanner({ missingConfig, emptyDataset }: Props) {
  if (missingConfig) {
    return (
      <div
        className="mb-4 rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] px-4 py-3 text-sm text-[#5B6F95]"
        role="status"
      >
        <span className="font-semibold text-[#0F172A]">Fuente de datos no configurada.</span>{" "}
        Define en Vercel las cuatro URLs CSV públicas (https válidas, no ejemplo) para cargar datos.
      </div>
    );
  }
  if (emptyDataset) {
    return (
      <div
        className="mb-4 rounded-xl border border-[#D7E3F8] bg-white px-4 py-3 text-sm text-[#5B6F95]"
        role="status"
      >
        <span className="font-semibold text-[#0F172A]">No hay datos disponibles.</span>{" "}
        Revisa el CSV, la URL o los filtros aplicados.
      </div>
    );
  }
  return null;
}
