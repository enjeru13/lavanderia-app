type Servicio = {
  id: number;
  nombreServicio: string;
  precioBase: number;
};

type Seleccionado = {
  servicioId: number;
  cantidad: number;
};

type Cliente = {
  nombre: string;
  apellido: string;
};

type Props = {
  cliente: Cliente | null;
  serviciosSeleccionados: Seleccionado[];
  serviciosCatalogo: Servicio[];
  observaciones: string;
  fechaEntrega: string;
};

export default function ResumenOrdenPanel({
  cliente,
  serviciosSeleccionados,
  serviciosCatalogo,
  observaciones,
  fechaEntrega,
}: Props) {
  const calcularSubtotal = (s: Seleccionado) => {
    const servicio = serviciosCatalogo.find((x) => x.id === s.servicioId);
    return servicio ? servicio.precioBase * s.cantidad : 0;
  };

  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-3">Resumen de la orden</h2>

      <div className="space-y-2 text-sm text-gray-700">
        {/* Cliente */}
        <div>
          <span className="font-semibold">Cliente:</span>{" "}
          {cliente ? `${cliente.nombre} ${cliente.apellido}` : "No asignado"}
        </div>

        {/* Servicios */}
        <div>
          <span className="font-semibold block mb-1">
            Servicios seleccionados:
          </span>
          {serviciosSeleccionados.length === 0 ? (
            <p className="text-gray-500 italic">Ningún servicio seleccionado</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {serviciosSeleccionados.map((s) => {
                const servicio = serviciosCatalogo.find(
                  (x) => x.id === s.servicioId
                );
                return (
                  <li key={s.servicioId}>
                    {servicio?.nombreServicio} — {s.cantidad} unidad(es) → $
                    {calcularSubtotal(s).toFixed(2)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Observaciones */}
        {observaciones && (
          <div>
            <span className="font-semibold">Observaciones:</span>{" "}
            {observaciones}
          </div>
        )}

        {/* Fecha estimada */}
        {fechaEntrega && (
          <div>
            <span className="font-semibold">Fecha de entrega:</span>{" "}
            {new Date(fechaEntrega).toLocaleDateString()}
          </div>
        )}
      </div>
    </section>
  );
}
