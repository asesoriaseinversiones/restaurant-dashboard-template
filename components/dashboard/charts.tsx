"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { AggregationItem, SerieMensual } from "@/types/domain";

interface MensualChartProps {
  data: SerieMensual[];
}

export function MensualChart({ data }: MensualChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#27314d" strokeDasharray="3 3" />
          <XAxis dataKey="periodo" stroke="#96a0c0" />
          <YAxis stroke="#96a0c0" />
          <Tooltip />
          <Legend />
          <Bar dataKey="pagado" fill="#7aa2ff" radius={[4, 4, 0, 0]} />
          <Bar dataKey="comprometido" fill="#4ade80" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieBreakdownProps {
  data: AggregationItem[];
}

export function PieBreakdown({ data }: PieBreakdownProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="valor" nameKey="nombre" outerRadius={100} fill="#7aa2ff" label />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
