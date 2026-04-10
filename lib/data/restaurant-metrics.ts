import type { RestaurantExecutiveMetrics, RestaurantTransaction } from "@/lib/types/restaurant";

const FOOD_RE =
  /aliment|comida|food|insumo|bebida|restaur|cocina|kitchen|mercader|insumos|lácteo|lacteo|abarrote/i;
const PAYROLL_RE =
  /nomina|nómina|salari|personal|rrhh|planilla|prestaci|beneficio|vacacion|horas extra/i;

function norm(s: string): string {
  return s.trim().toLowerCase();
}

export function buildRestaurantMetrics(txs: RestaurantTransaction[]): RestaurantExecutiveMetrics {
  let foodCostPaid = 0;
  let payrollPaid = 0;
  let otherExpensePaid = 0;
  let cashInflowsTotal = 0;
  let expensePaidTotal = 0;

  for (const t of txs) {
    if (t.kind === "cash_inflow") {
      cashInflowsTotal += t.amountPaid;
      continue;
    }
    expensePaidTotal += t.amountPaid;
    const blob = norm(`${t.category} ${t.subcategory} ${t.description}`);
    if (FOOD_RE.test(blob)) foodCostPaid += t.amountPaid;
    else if (PAYROLL_RE.test(blob)) payrollPaid += t.amountPaid;
    else otherExpensePaid += t.amountPaid;
  }

  const foodCostPercentOfSales =
    cashInflowsTotal > 0 ? (foodCostPaid / cashInflowsTotal) * 100 : null;
  const payrollPercentOfSales =
    cashInflowsTotal > 0 ? (payrollPaid / cashInflowsTotal) * 100 : null;
  const grossMarginPercent =
    cashInflowsTotal > 0 ? ((cashInflowsTotal - foodCostPaid) / cashInflowsTotal) * 100 : null;
  const operatingMarginPercent =
    cashInflowsTotal > 0
      ? ((cashInflowsTotal - expensePaidTotal) / cashInflowsTotal) * 100
      : null;

  const variableApprox = foodCostPaid + payrollPaid;
  const fixedApprox = Math.max(0, expensePaidTotal - variableApprox);
  const cmNumerator = cashInflowsTotal - variableApprox;
  const cmRatio = cashInflowsTotal > 0 ? cmNumerator / cashInflowsTotal : 0;

  let breakEvenSalesApprox: number | null = null;
  let breakEvenBasisNote: string | null = null;

  if (cashInflowsTotal <= 0) {
    breakEvenBasisNote = "Sin ingresos de caja en el periodo filtrado.";
  } else if (cmRatio <= 0.1) {
    breakEvenBasisNote =
      "Margen de contribución estimado demasiado bajo para un punto de equilibrio fiable.";
  } else if (fixedApprox <= 0) {
    breakEvenBasisNote =
      "No se detectaron costos fijos (heurística) por encima de variable aproximada.";
  } else {
    breakEvenSalesApprox = fixedApprox / cmRatio;
    breakEvenBasisNote =
      "Aprox.: fijos = egresos no clasificados como insumos/nómina; variable = insumos + nómina (palabras clave).";
  }

  return {
    foodCostPaid,
    payrollPaid,
    otherExpensePaid,
    cashInflowsTotal,
    expensePaidTotal,
    foodCostPercentOfSales,
    payrollPercentOfSales,
    grossMarginPercent,
    operatingMarginPercent,
    breakEvenSalesApprox,
    breakEvenBasisNote
  };
}
