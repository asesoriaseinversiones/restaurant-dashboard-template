export default function HomePage() {
  const kpis = [
    { label: "FACTURACIÓN", value: "$85,400", icon: "◌" },
    { label: "FOOD COST", value: "27%", icon: "↗" },
    { label: "PUNTO DE EQUILIBRIO", value: "$60,000", icon: "↑" },
    { label: "RENTABILIDAD", value: "18%", icon: "↗" },
  ];

  const weeklyBars = [
    { label: "Cajero", value: 52 },
    { label: "Kermit", value: 68 },
    { label: "Base", value: 79 },
    { label: "Pesimista", value: 96 },
  ];

  const scenarioBars = [
    { label: "JUNR", width: "88%", meta: "9800% / 779%" },
    { label: "Cena", width: "63%", meta: "398% / 639%" },
    { label: "Pesimista", width: "34%", meta: "100% / 07.4%" },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F8FBFF_0%,#EEF4FF_100%)] p-4 md:p-8">
      <section className="mx-auto max-w-7xl rounded-[28px] border border-[#C7D7F4] bg-[linear-gradient(180deg,#FFFFFF_0%,#F3F7FF_100%)] p-6 text-[#0F172A] shadow-[0_20px_60px_rgba(37,99,235,0.08)] md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Dashboard Actualizado
          </h1>
        </div>

        <div className="rounded-[24px] border border-[#D7E3F8] bg-[linear-gradient(180deg,#F8FBFF_0%,#EEF4FF_100%)] p-5 md:p-8">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#D7E3F8] bg-white px-5 py-3 text-sm text-[#5B6F95]">
            <span className="text-base">◷</span>
            <span>Semana del 12 — 18 marzo</span>
          </div>

          <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
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

          <div className="mb-10 grid gap-8 xl:grid-cols-2">
            <div>
              <h2 className="mb-5 text-2xl font-semibold text-[#0F172A]">
                <span className="font-bold">Facturación</span>{" "}
                <span className="text-[#5B6F95]">Semanal</span>
              </h2>

              <div className="flex h-[220px] items-end gap-3 md:gap-4">
                {weeklyBars.map((bar, index) => (
                  <div key={bar.label} className="flex flex-1 flex-col items-center">
                    <div
                      className={`w-full rounded-t-[8px] ${
                        index === weeklyBars.length - 1
                          ? "bg-[linear-gradient(180deg,#8BB8FF_0%,#3B82F6_100%)]"
                          : "bg-[linear-gradient(180deg,#4F8CFF_0%,#2563EB_100%)]"
                      }`}
                      style={{ height: `${bar.value * 1.5}px` }}
                    />
                    <div className="mt-3 text-sm text-[#64748B]">{bar.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-5 text-2xl font-semibold text-[#0F172A]">
                <span className="font-bold">Gastos</span>{" "}
                <span className="text-[#5B6F95]">y Balance</span>
              </h2>

              <div className="overflow-hidden rounded-[16px] border border-[#D7E3F8]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-transparent text-[#6B7EA5]">
                    <tr className="border-b border-[#D7E3F8]">
                      <th className="px-4 py-4 font-medium">Pesimista</th>
                      <th className="px-4 py-4 font-medium">Optimista</th>
                      <th className="px-4 py-4 font-medium">Base</th>
                      <th className="px-4 py-4 font-medium">Pesimista</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg text-[#334155]">
                    <tr className="border-b border-[#D7E3F8]">
                      <td className="px-4 py-4 font-semibold text-white">Optimista</td>
                      <td className="px-4 py-4">600,000</td>
                      <td className="px-4 py-4">610,000</td>
                      <td className="px-4 py-4">800,000</td>
                    </tr>
                    <tr className="border-b border-[#D7E3F8]">
                      <td className="px-4 py-4 font-semibold text-white">Base</td>
                      <td className="px-4 py-4">580,000</td>
                      <td className="px-4 py-4">400,000</td>
                      <td className="px-4 py-4">500,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 font-semibold text-white">Pesimista</td>
                      <td className="px-4 py-4">$58,000</td>
                      <td className="px-4 py-4">-50,000</td>
                      <td className="px-4 py-4">$50,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <div>
              <h2 className="mb-5 text-2xl font-semibold text-[#0F172A]">
                <span className="font-bold">Gastos</span>{" "}
                <span className="text-[#5B6F95]">y Balance</span>
              </h2>

              <div className="overflow-hidden rounded-[16px] border border-[#D7E3F8]">
                <table className="w-full text-left text-sm">
                  <thead className="text-[#6B7EA5]">
                    <tr className="border-b border-[#D7E3F8]">
                      <th className="px-4 py-4 font-medium">Seminal</th>
                      <th className="px-4 py-4 font-medium">Optimista</th>
                      <th className="px-4 py-4 font-medium">Base</th>
                      <th className="px-4 py-4 font-medium">Pesimista</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg text-[#334155]">
                    <tr className="border-b border-[#D7E3F8]">
                      <td className="px-4 py-4 font-semibold text-white">Escenario</td>
                      <td className="px-4 py-4">2,100,000</td>
                      <td className="px-4 py-4">$710,000</td>
                      <td className="px-4 py-4">$58,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 font-semibold text-white">
                        Utilidad a vector
                      </td>
                      <td className="px-4 py-4">$130,000</td>
                      <td className="px-4 py-4">$40,000</td>
                      <td className="px-4 py-4">$56,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="mb-5 text-2xl font-semibold text-[#0F172A]">
                <span className="font-bold">Comparación</span>{" "}
                <span className="text-[#5B6F95]">de Escenarios</span>
              </h2>

              <div className="space-y-6">
                {scenarioBars.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-[#6B7EA5]">{item.label}</span>
                      <span className="text-[#5B6F95]">{item.meta}</span>
                    </div>
                    <div className="h-5 overflow-hidden rounded-full bg-[#DCE8FF]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#2563EB_0%,#60A5FA_100%)]"
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#D7E3F8] pt-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-4 w-4 rotate-45 bg-[#2563EB]" />
            <h3 className="text-2xl font-semibold text-[#0F172A]">Resumen Ejecutivo</h3>
          </div>

          <div className="space-y-6 text-xl leading-relaxed text-[#475569]">
            <p className="border-b border-[#D7E3F8] pb-5">
              Dashboard editable de inicio con gastos resumidos de la apertura y
              análisis financiero inicial.
            </p>

            <p className="border-b border-[#D7E3F8] pb-5">
              Diagnóstico inicial del negocio: proyección, costos iniciales, rango
              de precios en compras asequibles dentro de las posibilidades del
              negocio, punto de equilibrio inicial.
            </p>

            <p>
              Cuánto tengo que <span className="font-semibold text-[#0F172A]">facturar</span>;
              cuánto es lo <span className="font-semibold text-[#0F172A]">mínimo en compras</span>,
              qué compras, cuánto es el personal máximo.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}