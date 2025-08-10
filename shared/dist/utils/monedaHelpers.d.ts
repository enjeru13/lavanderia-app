export type Moneda = "USD" | "VES" | "COP";
export interface TasasConversion {
    VES?: number | null;
    COP?: number | null;
}
/**
 * Convierte un monto hacia la moneda principal, usando tasas.
 * Ejemplo: Bs 80 / tasa VES → USD
 */
export declare function convertirAmonedaPrincipal(monto: number, moneda: Moneda, tasas: TasasConversion, principal?: Moneda): number;
/**
 * Convierte desde la moneda principal hacia otra, usando tasas.
 * Ejemplo: USD → Bs (VES) * tasa VES
 */
export declare function convertirDesdePrincipal(monto: number, destino: Moneda, tasas: TasasConversion, principal?: Moneda): number;
/**
 * Formatea visualmente un monto como moneda local.
 * Ejemplo: 12.5 → "$12.50" o "Bs 12,50"
 */
export declare function formatearMoneda(monto: number, moneda?: Moneda): string;
/**
 * Convierte string de tasa (que puede tener coma o miles) en número válido.
 * Ejemplo: "2,500.00" → 2500, "3.5" → 3.5
 */
export declare function parsearTasa(valor: string): number | undefined;
/**
 * Formatea tasa para mostrar como string con dos decimales.
 */
export declare function formatearTasa(valor: number | string): string;
/**
 * Sanitiza monto ingresado como texto, acepta coma, punto y elimina símbolos.
 * Ejemplo: "Bs. 12,5" → 12.5
 */
export declare function parsearMonto(valor: string): number;
//# sourceMappingURL=monedaHelpers.d.ts.map