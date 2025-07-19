import { formatearMoneda } from "../../utils/monedaHelpers";
import type { Servicio, ServicioSeleccionado } from "../../types/types";

type Props = {
  serviciosCatalogo: Servicio[];
  serviciosSeleccionados: ServicioSeleccionado[];
  setServiciosSeleccionados: React.Dispatch<
    React.SetStateAction<ServicioSeleccionado[]>
  >;
};

export default function ServiciosPanel({
  serviciosCatalogo,
  serviciosSeleccionados,
  setServiciosSeleccionados,
}: Props) {
  const actualizarCantidad = (servicioId: number, cantidad: number) => {
    setServiciosSeleccionados((prev) => {
      const otros = prev.filter((s) => s.servicioId !== servicioId);
      return cantidad > 0 ? [...otros, { servicioId, cantidad }] : [...otros];
    });
  };

  return (
    <section className="bg-white p-6 font-semibold rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Servicios disponibles
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviciosCatalogo.map((servicio) => {
          const actual = serviciosSeleccionados.find(
            (s) => s.servicioId === servicio.id
          );
          const cantidad = actual?.cantidad ?? 0;
          const subtotal = cantidad * servicio.precioBase;

          return (
            <div
              key={servicio.id}
              className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              {/* Nombre del servicio */}
              <div className="text-base font-semibold text-gray-800">
                {servicio.nombre}
              </div>

              {/* Precio base */}
              <div className="text-sm text-indigo-600 font-bold">
                {formatearMoneda(servicio.precioBase, "USD")}
              </div>

              {/* Campo cantidad */}
              <input
                type="number"
                min={0}
                step={servicio.descripcion?.includes("decimal") ? 0.1 : 1}
                value={cantidad === 0 ? "" : String(cantidad)}
                onChange={(e) =>
                  actualizarCantidad(servicio.id, parseFloat(e.target.value))
                }
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring focus:ring-indigo-200 text-sm"
                placeholder="Cantidad"
              />

              {/* Subtotal */}
              {cantidad > 0 && (
                <div className="text-sm text-green-700 font-medium pt-1">
                  Subtotal: {formatearMoneda(subtotal, "USD")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
