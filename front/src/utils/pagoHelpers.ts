interface Pago {
  monto: number;
  moneda: string;
}

interface OrdenPago {
  total: number;
  pagos?: Pago[];
}

import { convertirAmonedaPrincipal } from "./convertirMonedaHelpers";

export function totalAbonadoConvertido(
  orden: OrdenPago,
  tasas: { VES?: number; COP?: number },
  monedaPrincipal: string = "USD"
): number {
  return (orden.pagos || []).reduce(
    (sum, p) => sum + convertirAmonedaPrincipal(p.monto, p.moneda, tasas, monedaPrincipal),
    0
  );
}

export function obtenerEstadoPagoConvertido(
  orden: OrdenPago,
  tasas: { VES?: number; COP?: number },
  monedaPrincipal = "USD"
): "Sin pagos" | "Parcial" | "Pagado" {
  const abonado = totalAbonadoConvertido(orden, tasas, monedaPrincipal);
  if (abonado === 0) return "Sin pagos";
  if (abonado >= orden.total) return "Pagado";
  return "Parcial";
}