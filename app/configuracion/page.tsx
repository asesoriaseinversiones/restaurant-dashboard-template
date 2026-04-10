import { getPublicCsvUrlStatus, hasPublicCsvConfig } from "@/config/env";

export const dynamic = "force-dynamic";

export default function ConfiguracionPage() {
  const configOk = hasPublicCsvConfig();
  const status = getPublicCsvUrlStatus();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Configuracion tecnica</h1>
        <p className="text-sm text-muted">URLs CSV publicas y despliegue en Vercel</p>
        <div className="mt-4 rounded-xl border border-[#D7E3F8] bg-[#F8FBFF] p-4 text-sm text-[#334155]">
          <p className="font-semibold text-[#0F172A]">Estado de variables CSV</p>
          <p className="mt-2">
            Configuración completa:{" "}
            <span className={configOk ? "font-semibold text-[#0F172A]" : "text-[#5B6F95]"}>
              {configOk ? "Sí (cuatro URLs https)" : "No — se usan datos vacíos hasta configurar env"}
            </span>
          </p>
          <ul className="mt-2 list-inside list-disc text-[#64748B]">
            {Object.entries(status).map(([key, ok]) => (
              <li key={key}>
                {key}: {ok ? "OK" : "falta o URL inválida"}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[#64748B]">
            No se aceptan URLs de ejemplo (example.com), placeholders en la ruta ni esquemas distintos de
            http/https.
          </p>
        </div>
      </header>

      <section className="mt-10 rounded-[24px] border border-[#D7E3F8] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.06)] md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#0F172A]">
            Términos, Condiciones y Guía de Uso
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#475569]">
            Estas condiciones de uso ayudan a mantener el correcto funcionamiento del
            dashboard, evitar errores operativos y asegurar que la información y las
            automatizaciones se mantengan estables.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#D7E3F8] bg-[#F8FBFF] p-5">
            <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">
              No modificar fórmulas de Excel
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-[#475569]">
              <li>- No eliminar ni editar celdas con fórmulas.</li>
              <li>- No arrastrar fórmulas manualmente si no se conoce su funcionamiento.</li>
              <li>- Solo completar las celdas destinadas a ingreso de datos.</li>
              <li>- Las celdas de cálculo automático deben mantenerse sin modificación.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#D7E3F8] bg-[#F8FBFF] p-5">
            <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">
              No cambiar nombres de hojas o pestañas
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-[#475569]">
              <li>- Mantener exactamente el nombre original de cada hoja.</li>
              <li>- No eliminar pestañas aunque parezcan secundarias.</li>
              <li>- Cambiar nombres puede afectar referencias y visualizaciones automáticas.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#D7E3F8] bg-[#F8FBFF] p-5">
            <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">
              No modificar prompts configurados
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-[#475569]">
              <li>- No editar prompts, instrucciones o comandos ya asignados.</li>
              <li>- Si se requiere un ajuste, hacerlo solo sobre una copia de respaldo.</li>
              <li>- Nunca eliminar prompts principales sin supervisión técnica.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#D7E3F8] bg-[#F8FBFF] p-5">
            <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">
              No borrar archivos vinculados
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-[#475569]">
              <li>- Mantener la estructura original de carpetas y archivos.</li>
              <li>- No renombrar documentos, imágenes, excels o PDFs vinculados al sistema.</li>
              <li>- Si se reemplaza un archivo, debe conservar el mismo nombre y formato.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#D7E3F8] bg-[#F8FBFF] p-5">
            <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">
              Utilizar únicamente las áreas editables
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-[#475569]">
              <li>- Completar solo espacios preparados para edición manual.</li>
              <li>- No modificar bloques de diseño, gráficas o configuraciones internas.</li>
              <li>- Si una celda está protegida, no intentar desbloquearla.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#D7E3F8] bg-[#F8FBFF] p-5">
            <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">
              Buen uso del dashboard
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-[#475569]">
              <li>- Ingresar primero ventas, costos, nómina y gastos fijos.</li>
              <li>- Revisar luego facturación, food cost, rentabilidad y punto de equilibrio.</li>
              <li>- Usar escenarios optimista, base y pesimista para tomar decisiones.</li>
              <li>- Utilizar los gráficos como apoyo visual sin alterar su configuración.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#D7E3F8] bg-[#F8FBFF] p-5">
            <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">
              Revisión y respaldo
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-[#475569]">
              <li>- Confirmar datos antes de guardar cambios.</li>
              <li>- Revisar fechas, porcentajes y valores monetarios.</li>
              <li>- Guardar siempre una copia de seguridad antes de cambios importantes.</li>
              <li>- Crear versiones por fecha para evitar pérdida de información.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#D7E3F8] bg-[#F8FBFF] p-5">
            <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">
              Soporte y modificaciones
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-[#475569]">
              <li>- Cualquier cambio estructural debe hacerse con apoyo técnico.</li>
              <li>- No modificar automatizaciones sobre la versión principal sin respaldo.</li>
              <li>- Si se desea cambiar estructura, fórmulas o diseño, trabajar sobre una copia.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
