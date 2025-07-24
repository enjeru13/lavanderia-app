import { formatearMoneda, type Moneda } from "../../utils/monedaHelpers";
import type {
  Servicio,
  ServicioSeleccionado,
} from "../../../../shared/types/types";
import React from "react";
import { MdOutlineLocalLaundryService } from "react-icons/md";

type Props = {
  serviciosCatalogo: Servicio[];
  serviciosSeleccionados: ServicioSeleccionado[];
  setServiciosSeleccionados: React.Dispatch<
    React.SetStateAction<ServicioSeleccionado[]>
  >;
  monedaPrincipal: Moneda;
};

export default function ServiciosPanel({
  serviciosCatalogo,
  serviciosSeleccionados,
  setServiciosSeleccionados,
  monedaPrincipal,
}: Props) {
  const actualizarCantidad = (servicioId: number, cantidad: number) => {
    setServiciosSeleccionados((prev) => {
      const otros = prev.filter((s) => s.servicioId !== servicioId);
      return cantidad > 0 ? [...otros, { servicioId, cantidad }] : [...otros];
    });
  };

  return (
    <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
      <header className="pb-4 border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <MdOutlineLocalLaundryService size={28} className="text-blue-500" />
          Servicios disponibles
        </h2>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviciosCatalogo.map((servicio) => {
          const actual = serviciosSeleccionados.find(
            (s) => s.servicioId === servicio.id
          );
          const cantidad = actual?.cantidad ?? 0;
          const subtotal = cantidad * servicio.precioBase;

          const stepValue = servicio.permiteDecimales ? 0.1 : 1;

          return (
            <div
              key={servicio.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 space-y-4" // Estilo de tarjeta de servicio mejorado
            >
              <div className="text-xl font-bold text-gray-900">
                {servicio.nombreServicio}
              </div>

              {servicio.descripcion && (
                <p className="text-sm text-gray-600 italic font-semibold">
                  {servicio.descripcion}
                </p>
              )}

              <div className="text-lg text-indigo-700 font-extrabold">
                {formatearMoneda(servicio.precioBase, monedaPrincipal)}
              </div>

              <input
                type="number"
                min={0}
                step={stepValue}
                value={cantidad === 0 ? "" : String(cantidad)}
                onChange={(e) =>
                  actualizarCantidad(servicio.id, parseFloat(e.target.value))
                }
                className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base shadow-sm transition duration-200" // Estilo de input consistente
                placeholder="Ingresa la cantidad"
              />

              {cantidad > 0 && (
                <div className="text-lg text-green-700 font-bold pt-2">
                  Subtotal: {formatearMoneda(subtotal, monedaPrincipal)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
