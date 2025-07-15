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
