import { formatearMoneda, type Moneda } from "../../utils/monedaHelpers";
import type {
  ClienteResumen,
  Servicio,
  ServicioSeleccionado,
} from "../../../../shared/types/types";
import { FaClipboardList } from "react-icons/fa";

type Props = {
  cliente: ClienteResumen | null;
  serviciosSeleccionados: ServicioSeleccionado[];
  serviciosCatalogo: Servicio[];
  observaciones: string;
  fechaEntrega: string;
  monedaPrincipal: Moneda;
};

export default function ResumenOrdenPanel({
  cliente,
  serviciosSeleccionados,
  serviciosCatalogo,
  observaciones,
  fechaEntrega,
  monedaPrincipal,
}: Props) {
  const calcularSubtotalServicio = (s: ServicioSeleccionado) => {
    const servicio = serviciosCatalogo.find((x) => x.id === s.servicioId);
    return servicio ? servicio.precioBase * s.cantidad : 0;
  };

  const formatFechaEntrega = (dateString: string) => {
    if (!dateString) return "No definida";
    try {
      const [y, m, d] = dateString.split("-");
      return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(
        "es-VE",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch (error) {
      console.error("Error al formatear fecha de entrega:", error);
      return dateString;
    }
  };

  return (
    <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
      {" "}
      <header className="pb-4 border-b border-gray-200 mb-6">
        {" "}
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          {" "}
          <FaClipboardList size={28} className="text-teal-600" /> Resumen de la
          orden
        </h2>
        <p className="text-base text-gray-600 mt-2">
          {" "}
          Detalle general antes de confirmar.
        </p>
      </header>
      <div className="space-y-5 text-base text-gray-800">
        {" "}
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
          {" "}
          <span className="font-semibold text-gray-700 block mb-1">
            Cliente:
          </span>{" "}
          {cliente ? (
            <span className="text-gray-900">
              {cliente.nombre} {cliente.apellido}
            </span>
          ) : (
            <span className="italic text-gray-500">No asignado</span>
          )}
        </div>
        <div>
          <span className="text-gray-700 block mb-3 font-semibold">
            {" "}
            Servicios seleccionados:
          </span>
          {serviciosSeleccionados.length === 0 ? (
            <p className="text-gray-500 italic bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
              Ningún servicio seleccionado
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              {" "}
              {serviciosSeleccionados.map((s) => {
                const servicio = serviciosCatalogo.find(
                  (x) => x.id === s.servicioId
                );
                return (
                  <li
                    key={s.servicioId}
                    className="p-4 flex justify-between items-center hover:bg-gray-50 transition duration-200 ease-in-out"
                  >
                    <span className="font-medium text-gray-900">
                      {servicio?.nombreServicio ?? "Servicio desconocido"} ×{" "}
                      {s.cantidad}
                    </span>
                    <span className="font-bold text-green-700">
                      {formatearMoneda(
                        calcularSubtotalServicio(s),
                        monedaPrincipal
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {observaciones && (
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
            {" "}
            <span className="font-semibold text-gray-700 block mb-1">
              Observaciones:
            </span>
            <p className="text-gray-900">{observaciones}</p>{" "}
          </div>
        )}
        {fechaEntrega && (
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
            {" "}
            <span className="font-semibold text-gray-700 block mb-1">
              Fecha de entrega:
            </span>{" "}
            <span className="text-gray-900">
              {formatFechaEntrega(fechaEntrega)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
