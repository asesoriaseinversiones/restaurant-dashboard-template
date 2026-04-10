import { NextResponse } from "next/server";
import { getTransacciones } from "@/lib/data/transacciones-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await getTransacciones({
    search: searchParams.get("search") ?? undefined,
    categoria: searchParams.get("categoria") ?? undefined,
    responsable: searchParams.get("responsable") ?? undefined,
    estadoPago: searchParams.get("estadoPago") ?? undefined,
    etapaObra: searchParams.get("etapaObra") ?? undefined,
    fechaDesde: searchParams.get("fechaDesde") ?? undefined,
    fechaHasta: searchParams.get("fechaHasta") ?? undefined,
    page: Number(searchParams.get("page") ?? 1)
  });
  return NextResponse.json(data);
}
