import Link from "next/link";
import type { Route } from "next";

const links = [
  { href: "/", label: "Resumen Ejecutivo" },
  { href: "/transacciones", label: "Diagnóstico Inicial" },
  { href: "/presupuesto", label: "Costos y Rentabilidad" },
  { href: "/hitos", label: "Operación y Soporte" },
  { href: "/configuracion", label: "Elementos Clave" }
];


export function SidebarNav() {
  return (
<aside className="panel sticky top-6 h-fit min-h-[calc(100vh-48px)] p-6">
<p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#111827]">
  Restaurante Panama
</p>
      <nav className="space-y-1">
        {links.map((link) => (
    <Link
    key={link.href}
    href={link.href as Route}
  className="block rounded-2xl px-4 py-3 text-[15px] font-semibold text-[#374151] transition hover:bg-[#F3F4F6] hover:text-[#111827]"

  >
    {link.label}
  </Link>
        ))}
      </nav>
    </aside>
  );
}
