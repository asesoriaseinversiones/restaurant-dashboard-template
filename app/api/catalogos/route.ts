import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/data/factory";

export async function GET() {
  const source = getDataSource();
  const data = await source.getCatalogos();
  return NextResponse.json(data);
}
