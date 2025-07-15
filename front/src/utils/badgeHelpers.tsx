export function badgeEstado(estado: string) {
  const map: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    ENTREGADO: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
        map[estado] || "bg-red-100 text-red-700"
      }`}
    >
      {estado}
    </span>
  );
}

export function badgePago(estadoPago: string) {
  const map: Record<string, string> = {
    "INCOMPLETO": "bg-red-100 text-red-700",
    "COMPLETO": "bg-green-100 text-green-700",
    Parcial: "bg-yellow-100 text-yellow-800",
    Pagado: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
        map[estadoPago] || "bg-gray-100 text-gray-600"
      }`}
    >
      {estadoPago}
    </span>
  );
}
