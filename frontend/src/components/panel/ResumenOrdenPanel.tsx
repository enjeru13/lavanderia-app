import { formatearMoneda, type Moneda } from "../../utils/monedaHelpers";
import type {
  ClienteResumen,
  Servicio,
  ServicioSeleccionado,
} from "@lavanderia/shared/types/types";
import { FaClipboardList, FaTshirt, FaTag, FaInfoCircle } from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

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
  // --- LÓGICA CORREGIDA ---
  // Calcular subtotal real considerando precio personalizado si existe
  const calcularSubtotalServicio = (s: ServicioSeleccionado) => {
    const servicio = serviciosCatalogo.find((x) => x.id === s.servicioId);

    // 1. Busamos el precio: Si 's.precio' existe (editado), úsalo. Si no, usa el del catálogo.
    const precioUnitario = s.precio ?? servicio?.precioBase ?? 0;

    // 2. Calculamos el bruto
    const bruto = precioUnitario * s.cantidad;

    // 3. Restamos descuento (si existe)
    const descuento = s.descuento || 0;

    return Math.max(0, bruto - descuento);
  };

  const totalPrendas = serviciosSeleccionados.reduce(
    (sum, item) => sum + item.cantidad,
    0
  );

  const formatFechaEntrega = (dateString: string) => {
    if (!dateString) return "No definida";
    const fecha = dayjs(dateString);
    return fecha.isValid() ? fecha.format("DD/MM/YYYY") : "Fecha inválida";
  };

  return (
    <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
      <header className="pb-4 border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FaClipboardList size={28} className="text-teal-600" /> Resumen de la
          orden
        </h2>
        <p className="text-base text-gray-600 mt-2">
          Detalle general antes de confirmar.
        </p>
      </header>

      <div className="space-y-5 text-base text-gray-800">
        {/* SECCIÓN CLIENTE */}
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
          <span className="font-semibold text-gray-700 block mb-1">
            Cliente:
          </span>
          {cliente ? (
            <span className="text-gray-900 font-medium text-lg">
              {cliente.nombre} {cliente.apellido}
            </span>
          ) : (
            <span className="italic text-gray-500">No asignado</span>
          )}
        </div>

        {/* SECCIÓN SERVICIOS */}
        <div>
          <span className="text-gray-700 block mb-3 font-semibold">
            Servicios seleccionados:
          </span>
          {serviciosSeleccionados.length === 0 ? (
            <p className="text-gray-500 italic bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
              Ningún servicio seleccionado
            </p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <ul className="divide-y divide-gray-200">
                {serviciosSeleccionados.map((s) => {
                  const servicio = serviciosCatalogo.find(
                    (x) => x.id === s.servicioId
                  );
                  const descuento = s.descuento || 0;
                  const tieneDescuento = descuento > 0;

                  // Detectar si es precio editado para mostrar indicador visual (Opcional pero útil)
                  const precioUsado = s.precio ?? servicio?.precioBase ?? 0;
                  const esPrecioEditado =
                    servicio && precioUsado !== servicio.precioBase;

                  return (
                    <li
                      key={s.servicioId}
                      className="p-4 flex justify-between items-center hover:bg-gray-50 transition duration-200 ease-in-out"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 flex items-center gap-2">
                          {servicio?.nombreServicio ?? "Servicio desconocido"}

                          <span className="font-bold text-gray-800 bg-gray-200 px-2 py-0.5 rounded text-sm">
                            × {s.cantidad}
                          </span>

                          {esPrecioEditado && (
                            <span
                              className="text-xs text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200 flex items-center gap-1"
                              title="Precio modificado manualmente"
                            >
                              <FaInfoCircle size={10} /> Editado
                            </span>
                          )}
                        </span>

                        {tieneDescuento && (
                          <span className="text-xs text-orange-600 flex items-center gap-1 mt-1 font-semibold">
                            <FaTag size={10} /> Descuento aplicado: -
                            {formatearMoneda(descuento, monedaPrincipal)}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-green-700 block text-lg">
                          {formatearMoneda(
                            calcularSubtotalServicio(s),
                            monedaPrincipal
                          )}
                        </span>
                        {/* Mostrar el unitario pequeño debajo para referencia */}
                        <span className="text-xs text-gray-400 block">
                          Unit: {formatearMoneda(precioUsado, monedaPrincipal)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="bg-blue-50 p-4 border-t border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-800 font-bold">
                  <FaTshirt />
                  <span>Total de prendas/items:</span>
                </div>
                <span className="bg-white text-blue-900 font-extrabold px-4 py-1 rounded-full border border-blue-200 text-lg shadow-sm">
                  {totalPrendas}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* OBSERVACIONES Y FECHA */}
        {observaciones && (
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
            <span className="font-semibold text-gray-700 block mb-1">
              Observaciones:
            </span>
            <p className="text-gray-900 break-words whitespace-pre-wrap">
              {observaciones}
            </p>
          </div>
        )}
        {fechaEntrega && (
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
            <span className="font-semibold text-gray-700 block mb-1">
              Fecha de entrega estimada:
            </span>
            <span className="text-gray-900 font-medium">
              {formatFechaEntrega(fechaEntrega)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
