import type {
  ClienteResumen,
  Servicio,
  ServicioSeleccionado,
} from "../../types/types"; // Ajustá el path según tu estructura

type Props = {
  cliente: ClienteResumen | null;
  serviciosSeleccionados: ServicioSeleccionado[];
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
  const calcularSubtotal = (s: ServicioSeleccionado) => {
    const servicio = serviciosCatalogo.find((x) => x.id === s.servicioId);
    return servicio ? servicio.precioBase * s.cantidad : 0;
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <header>
        <h2 className="text-xl font-bold text-gray-800">Resumen de la orden</h2>
        <p className="text-sm text-gray-500">
          Detalle general antes de confirmar
        </p>
      </header>

      <div className="space-y-4 text-sm text-gray-700 font-medium">
        {/* Cliente */}
        <div className="bg-gray-50 p-3 rounded border">
          <span className="text-gray-600">Cliente:</span>{" "}
          {cliente ? (
            <span>
              {cliente.nombre} {cliente.apellido}
            </span>
          ) : (
            <span className="italic text-gray-500">No asignado</span>
          )}
        </div>

        {/* Servicios seleccionados */}
        <div>
          <span className="text-gray-600 block mb-2 font-semibold">
            Servicios seleccionados:
          </span>
          {serviciosSeleccionados.length === 0 ? (
            <p className="text-gray-500 italic">Ningún servicio seleccionado</p>
          ) : (
            <ul className="divide-y border rounded overflow-hidden bg-white text-sm">
              {serviciosSeleccionados.map((s) => {
                const servicio = serviciosCatalogo.find(
                  (x) => x.id === s.servicioId
                );
                return (
                  <li
                    key={s.servicioId}
                    className="p-3 flex justify-between items-center"
                  >
                    <span>
                      {servicio?.nombre} × {s.cantidad}
                    </span>
                    <span className="font-bold text-green-700">
                      ${calcularSubtotal(s).toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Observaciones */}
        {observaciones && (
          <div className="bg-gray-50 p-3 rounded border">
            <span className="text-gray-600 block mb-1 font-semibold">
              Observaciones:
            </span>
            <p className="text-gray-700 italic">{observaciones}</p>
          </div>
        )}

        {/* Fecha de entrega */}
        {fechaEntrega && (
          <div className="bg-gray-50 p-3 rounded border">
            <span className="text-gray-600">Fecha de entrega:</span>{" "}
            {(() => {
              const [y, m, d] = fechaEntrega.split("-");
              return new Date(
                Number(y),
                Number(m) - 1,
                Number(d)
              ).toLocaleDateString("es-VE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
            })()}
          </div>
        )}
      </div>
    </section>
  );
}
