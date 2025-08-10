import { type Moneda, type TasasConversion } from "./monedaHelpers";
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
export declare function calcularTotalAbonado(pagos: Pago[] | undefined, tasas: TasasConversion, principal?: Moneda): number;
/**
 * Devuelve texto descriptivo del estado de pago (frontend)
 */
export declare function obtenerEstadoPagoTexto(total: number, abonado: number): EstadoPagoTexto;
/**
 * Devuelve estado crudo usado en backend (COMPLETO o INCOMPLETO)
 */
export declare function obtenerEstadoPagoRaw(total: number, abonado: number): EstadoPagoRaw;
/**
 * Calcula resumen completo de pago de una orden
 */
export declare function calcularResumenPago(orden: OrdenPago, tasas: TasasConversion, principal?: Moneda): {
    abonado: number;
    faltante: number;
    estadoRaw: EstadoPagoRaw;
    estadoTexto: EstadoPagoTexto;
};
//# sourceMappingURL=pagoFinance.d.ts.map