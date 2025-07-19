import {
  type Moneda,
  type TasasConversion,
  convertirAmonedaPrincipal,
} from "./monedaHelpers";

export interface Pago {
  monto: number;
  moneda: Moneda;
}

export interface OrdenPago {
  total: number;
  pagos?: Pago[];
}

export type EstadoPagoTexto = "Sin pagos" | "Parcial" | "Pagado";
export type EstadoPagoRaw = "COMPLETO" | "INCOMPLETO";

/**
 * Calcula el total abonado en moneda principal (USD por defecto)
 */
export function calcularTotalAbonado(
  pagos: Pago[] = [],
  tasas: TasasConversion,
  principal: Moneda = "USD"
): number {
  return pagos.reduce(
    (sum, p) =>
      sum + convertirAmonedaPrincipal(p.monto, p.moneda, tasas, principal),
    0
  );
}

/**
 * Devuelve texto descriptivo del estado de pago (frontend)
 */
export function obtenerEstadoPagoTexto(
  total: number,
  abonado: number
): EstadoPagoTexto {
  if (abonado === 0) return "Sin pagos";
  if (abonado >= total) return "Pagado";
  return "Parcial";
}

/**
 * Devuelve estado crudo usado en backend (COMPLETO o INCOMPLETO)
 */
export function obtenerEstadoPagoRaw(
  total: number,
  abonado: number
): EstadoPagoRaw {
  return abonado >= total ? "COMPLETO" : "INCOMPLETO";
}

/**
 * Calcula resumen completo de pago de una orden
 */
export function calcularResumenPago(
  orden: OrdenPago,
  tasas: TasasConversion,
  principal: Moneda = "USD"
) {
  const abonado = calcularTotalAbonado(orden.pagos ?? [], tasas, principal);
  const faltante = Math.max(orden.total - abonado, 0);
  const estadoRaw = obtenerEstadoPagoRaw(orden.total, abonado);
  const estadoTexto = obtenerEstadoPagoTexto(orden.total, abonado);

  return { abonado, faltante, estadoRaw, estadoTexto };
}
