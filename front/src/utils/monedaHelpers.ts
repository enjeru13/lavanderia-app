export type Moneda = "USD" | "VES" | "COP";

export interface TasasConversion {
  VES?: number;
  COP?: number;
}

/** Convierte desde una moneda a la principal */
export function convertirAmonedaPrincipal(
  monto: number,
  moneda: Moneda,
  tasas: TasasConversion,
  principal: Moneda = "USD"
): number {
  if (typeof monto !== "number" || isNaN(monto)) return 0;
  if (moneda === principal) return parseFloat(monto.toFixed(2));

  const tasa =
    moneda === "VES" ? tasas.VES : moneda === "COP" ? tasas.COP : undefined;

  return tasa && tasa > 0 ? parseFloat((monto / tasa).toFixed(2)) : 0;
}

/** Convierte desde la principal hacia otra */
export function convertirDesdePrincipal(
  monto: number,
  destino: Moneda,
  tasas: TasasConversion,
  principal: Moneda = "USD"
): number {
  if (typeof monto !== "number" || isNaN(monto)) return 0;
  if (destino === principal) return parseFloat(monto.toFixed(2));

  const tasa =
    destino === "VES" ? tasas.VES : destino === "COP" ? tasas.COP : undefined;

  return tasa && tasa > 0 ? parseFloat((monto * tasa).toFixed(2)) : 0;
}

/** Formatea visualmente el monto con símbolo de moneda */
export function formatearMoneda(monto: number, moneda: Moneda = "USD"): string {
  const locales: Record<Moneda, string> = {
    USD: "en-US",
    VES: "es-VE",
    COP: "es-CO",
  };

  const opciones: Intl.NumberFormatOptions = {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  return new Intl.NumberFormat(locales[moneda], opciones).format(monto);
}

/** Convierte una tasa string en número válido */
export function parsearTasa(valor: string): number | undefined {
  if (!valor) return undefined;
  const normalizado = valor.replace(",", ".");
  const limpio = normalizado.replace(/(?<=\d)\.(?=\d{3})/g, "");
  const num = parseFloat(limpio);
  return isNaN(num) ? undefined : num;
}

/** Devuelve la tasa como string fijo con dos decimales */
export function formatearTasa(valor: number | string): string {
  const num =
    typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;

  return isNaN(num) ? "" : num.toFixed(2);
}

/** Normaliza una cadena string como Moneda válida */
export function normalizarMoneda(input: unknown): Moneda {
  const valor = String(input).toUpperCase();
  if (valor === "VES") return "VES";
  if (valor === "COP") return "COP";
  return "USD";
}

/** Sanitiza montos string ingresados por el usuario */
export function parsearMonto(valor: string): number {
  const limpio = valor.replace(",", ".").replace(/[^\d.]/g, "");
  const num = parseFloat(limpio);
  return isNaN(num) ? 0 : num;
}
