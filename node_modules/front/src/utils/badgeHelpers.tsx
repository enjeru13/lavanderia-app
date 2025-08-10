import type {
  EstadoOrden,
  EstadoPagoRaw,
  EstadoPagoTexto,
} from "../../../shared/types/types";

export type EstadoPagoDisplay = EstadoPagoRaw | EstadoPagoTexto;

const baseBadge = "inline-block px-3 py-1 rounded-full text-sm font-bold";

/**
 * @param
 * @returns
 */
export function badgeEstado(estado: EstadoOrden) {
  const map: Record<EstadoOrden, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    ENTREGADO: "bg-blue-100 text-blue-800",
  };

  const clase = map[estado] || "bg-red-100 text-red-700";
  return (
    <span className={`${baseBadge} ${clase}`} title={`Estado: ${estado}`}>
      {estado}
    </span>
  );
}

/**
 * @param
 * @returns
 */
export function badgePago(estadoPago: EstadoPagoDisplay) {
  const map: Record<EstadoPagoDisplay, string> = {
    INCOMPLETO: "bg-red-100 text-red-700",
    COMPLETO: "bg-green-100 text-green-700",
    "Sin pagos": "bg-gray-100 text-gray-600",
    Parcial: "bg-yellow-100 text-yellow-800",
    Pagado: "bg-green-100 text-green-700",
  };

  const clase = map[estadoPago] || "bg-gray-100 text-gray-600";
  return (
    <span className={`${baseBadge} ${clase}`} title={`Pago: ${estadoPago}`}>
      {estadoPago}
    </span>
  );
}
