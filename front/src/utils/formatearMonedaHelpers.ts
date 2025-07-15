export function convertirAmonedaPrincipal(
  monto: number,
  moneda: string,
  tasas: { VES?: number; COP?: number },
  principal: string = "USD"
): number {
  if (moneda === principal) return parseFloat(monto.toFixed(2));

  if (moneda === "VES" && tasas.VES)
    return parseFloat((monto / tasas.VES).toFixed(2));
  if (moneda === "COP" && tasas.COP)
    return parseFloat((monto / tasas.COP).toFixed(2));

  return parseFloat(monto.toFixed(2));
}

export function convertirDesdePrincipal(
  monto: number,
  destino: string,
  tasas: { VES?: number; COP?: number },
  principal: string = "USD"
): number {
  if (destino === principal) return parseFloat(monto.toFixed(2));

  if (destino === "VES" && tasas.VES)
    return parseFloat((monto * tasas.VES).toFixed(2));
  if (destino === "COP" && tasas.COP)
    return parseFloat((monto * tasas.COP).toFixed(2));

  return parseFloat(monto.toFixed(2));
}

export function formatearMoneda(monto: number, moneda: string = "USD"): string {
  const opciones: Intl.NumberFormatOptions = {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  let locales = "en-US";
  if (moneda === "VES") locales = "es-VE";
  if (moneda === "COP") locales = "es-CO";

  return new Intl.NumberFormat(locales, opciones).format(monto);
}

export function parsearTasa(valor: string): number | undefined {
  if (!valor) return undefined;

  const normalizado = valor.replace(",", ".");
  const limpio = normalizado.replace(/(?<=\d)\.(?=\d{3})/g, "");
  const num = parseFloat(limpio);

  return isNaN(num) ? undefined : num;
}

export function formatearTasa(valor: number | string): string {
  const num =
    typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;

  return isNaN(num) ? "" : num.toFixed(2);
}
