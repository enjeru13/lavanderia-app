export type EstadoOrden = "PENDIENTE" | "ENTREGADO";
export type EstadoPago = "INCOMPLETO" | "COMPLETO" | "Parcial" | "Pagado";

const baseBadge = "inline-block px-3 py-1 rounded-full text-sm font-bold";

export function badgeEstado(estado: string) {
  const map: Record<EstadoOrden, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    ENTREGADO: "bg-blue-100 text-blue-800",
  };

  const clase = map[estado as EstadoOrden] || "bg-red-100 text-red-700";
  return (
    <span className={`${baseBadge} ${clase}`} title={`Estado: ${estado}`}>
      {estado}
    </span>
  );
}

export function badgePago(estadoPago: string) {
  const map: Record<EstadoPago, string> = {
    INCOMPLETO: "bg-red-100 text-red-700",
    COMPLETO: "bg-green-100 text-green-700",
    Parcial: "bg-yellow-100 text-yellow-800",
    Pagado: "bg-green-100 text-green-800",
  };

  const clase = map[estadoPago as EstadoPago] || "bg-gray-100 text-gray-600";
  return (
    <span className={`${baseBadge} ${clase}`} title={`Pago: ${estadoPago}`}>
      {estadoPago}
    </span>
  );
}
