"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularTotalAbonado = calcularTotalAbonado;
exports.obtenerEstadoPagoTexto = obtenerEstadoPagoTexto;
exports.obtenerEstadoPagoRaw = obtenerEstadoPagoRaw;
exports.calcularResumenPago = calcularResumenPago;
const monedaHelpers_1 = require("./monedaHelpers");
/**
 * Calcula el total abonado en moneda principal (USD por defecto)
 */
function calcularTotalAbonado(pagos = [], tasas, principal = "USD") {
    return pagos.reduce((sum, p) => sum + (0, monedaHelpers_1.convertirAmonedaPrincipal)(p.monto, p.moneda, tasas, principal), 0);
}
/**
 * Devuelve texto descriptivo del estado de pago (frontend)
 */
function obtenerEstadoPagoTexto(total, abonado) {
    if (abonado === 0)
        return "Sin pagos";
    if (abonado >= total)
        return "Pagado";
    return "Parcial";
}
/**
 * Devuelve estado crudo usado en backend (COMPLETO o INCOMPLETO)
 */
function obtenerEstadoPagoRaw(total, abonado) {
    return abonado >= total ? "COMPLETO" : "INCOMPLETO";
}
/**
 * Calcula resumen completo de pago de una orden
 */
function calcularResumenPago(orden, tasas, principal = "USD") {
    const abonado = calcularTotalAbonado(orden.pagos ?? [], tasas, principal);
    const faltante = Math.max(orden.total - abonado, 0);
    const estadoRaw = obtenerEstadoPagoRaw(orden.total, abonado);
    const estadoTexto = obtenerEstadoPagoTexto(orden.total, abonado);
    return { abonado, faltante, estadoRaw, estadoTexto };
}
//# sourceMappingURL=pagoFinance.js.map