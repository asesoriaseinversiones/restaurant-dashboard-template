import type { Metadata } from "next";
import "./globals.css";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export const metadata: Metadata = {
  title: "Dashboard Ejecutivo - Restaurante Panama",
  description: "Control financiero y operativo del proyecto restaurante"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <div className="container-page grid gap-4 md:grid-cols-[240px_1fr]">
          <SidebarNav />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
