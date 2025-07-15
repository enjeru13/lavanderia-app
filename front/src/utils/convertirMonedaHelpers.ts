export function convertirAmonedaPrincipal(
  monto: number,
  moneda: string,
  tasas: { VES?: number; COP?: number },
  principal: string = "USD"
): number {
  if (moneda === principal) return monto;

  if (moneda === "VES" && tasas.VES) return monto / tasas.VES;

  if (moneda === "COP" && tasas.COP) return monto / tasas.COP;

  return monto;
}

export function convertirDesdePrincipal(
  monto: number,
  destino: string,
  tasas: { VES?: number; COP?: number },
  principal: string = "USD"
): number {
  if (destino === principal) return monto;

  if (destino === "VES" && tasas.VES) return monto * tasas.VES;

  if (destino === "COP" && tasas.COP) return monto * tasas.COP;

  return monto;
}
