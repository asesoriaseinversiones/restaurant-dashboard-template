import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/data/dashboard-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await getDashboardData({
    fechaDesde: searchParams.get("fechaDesde") ?? undefined,
    fechaHasta: searchParams.get("fechaHasta") ?? undefined,
    categoria: searchParams.get("categoria") ?? undefined,
    responsable: searchParams.get("responsable") ?? undefined,
    estadoPago: searchParams.get("estadoPago") ?? undefined,
    etapaObra: searchParams.get("etapaObra") ?? undefined
  });

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300"
    }
  });
}
