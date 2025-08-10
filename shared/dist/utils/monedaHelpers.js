"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertirAmonedaPrincipal = convertirAmonedaPrincipal;
exports.convertirDesdePrincipal = convertirDesdePrincipal;
exports.formatearMoneda = formatearMoneda;
exports.parsearTasa = parsearTasa;
exports.formatearTasa = formatearTasa;
exports.parsearMonto = parsearMonto;
/**
 * Convierte un monto hacia la moneda principal, usando tasas.
 * Ejemplo: Bs 80 / tasa VES → USD
 */
function convertirAmonedaPrincipal(monto, moneda, tasas, principal = "USD") {
    if (typeof monto !== "number" || isNaN(monto))
        return 0;
    if (moneda === principal)
        return parseFloat(monto.toFixed(2));
    const tasa = moneda === "VES" ? tasas.VES : moneda === "COP" ? tasas.COP : undefined;
    return tasa && tasa > 0 ? parseFloat((monto / tasa).toFixed(2)) : 0;
}
/**
 * Convierte desde la moneda principal hacia otra, usando tasas.
 * Ejemplo: USD → Bs (VES) * tasa VES
 */
function convertirDesdePrincipal(monto, destino, tasas, principal = "USD") {
    if (typeof monto !== "number" || isNaN(monto))
        return 0;
    if (destino === principal)
        return parseFloat(monto.toFixed(2));
    const tasa = destino === "VES" ? tasas.VES : destino === "COP" ? tasas.COP : undefined;
    return tasa && tasa > 0 ? parseFloat((monto * tasa).toFixed(2)) : 0;
}
/**
 * Formatea visualmente un monto como moneda local.
 * Ejemplo: 12.5 → "$12.50" o "Bs 12,50"
 */
function formatearMoneda(monto, moneda = "USD") {
    const locales = {
        USD: "en-US",
        VES: "es-VE",
        COP: "es-CO",
    };
    const opciones = {
        style: "currency",
        currency: moneda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };
    const locale = locales[moneda] || "en-US";
    return new Intl.NumberFormat(locale, opciones).format(monto);
}
/**
 * Convierte string de tasa (que puede tener coma o miles) en número válido.
 * Ejemplo: "2,500.00" → 2500, "3.5" → 3.5
 */
function parsearTasa(valor) {
    if (!valor)
        return undefined;
    const normalizado = valor.replace(",", ".");
    const limpio = normalizado.replace(/(?<=\d)\.(?=\d{3})/g, "");
    const num = parseFloat(limpio);
    return isNaN(num) ? undefined : num;
}
/**
 * Formatea tasa para mostrar como string con dos decimales.
 */
function formatearTasa(valor) {
    const num = typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;
    return isNaN(num) ? "" : num.toFixed(2);
}
/**
 * Sanitiza monto ingresado como texto, acepta coma, punto y elimina símbolos.
 * Ejemplo: "Bs. 12,5" → 12.5
 */
function parsearMonto(valor) {
    const limpio = valor.replace(",", ".").replace(/[^\d.]/g, "");
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
}
