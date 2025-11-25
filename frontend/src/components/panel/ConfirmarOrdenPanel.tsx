import { useMemo } from "react"; // IMPORTANTE: Agregar useMemo
import type {
  Servicio,
  ServicioSeleccionado,
} from "@lavanderia/shared/types/types";
import {
  formatearMoneda,
  convertirDesdePrincipal,
  type Moneda,
  type TasasConversion,
} from "../../utils/monedaHelpers";
import { FaDollarSign, FaRegTimesCircle, FaPlusCircle } from "react-icons/fa";

interface Props {
  serviciosSeleccionados: ServicioSeleccionado[];
  serviciosCatalogo: Servicio[];
  onRegistrar: () => void;
  onCancelar: () => void;
  monedaPrincipal: Moneda;
  tasas: TasasConversion;
  isFormValid: boolean;
  isSaving: boolean;
  // Eliminamos subtotal y descuentoTotal porque se calculan aquí
}

export default function ConfirmarOrdenPanel({
  serviciosSeleccionados,
  serviciosCatalogo,
  onRegistrar,
  onCancelar,
  monedaPrincipal,
  tasas,
  isFormValid,
  isSaving,
}: Props) {
  // --- 1. CALCULAMOS EL TOTAL AQUÍ ---
  const totalCalculado = useMemo(() => {
    return serviciosSeleccionados.reduce((acc, item) => {
      const servicio = serviciosCatalogo.find((s) => s.id === item.servicioId);

      // Usamos el precio personalizado (item.precio) o el base (servicio.precioBase)
      const precioReal = item.precio ?? servicio?.precioBase ?? 0;

      const subtotalItem = precioReal * item.cantidad;
      const descuento = item.descuento || 0; // Por si implementas descuentos luego

      return acc + Math.max(0, subtotalItem - descuento);
    }, 0);
  }, [serviciosSeleccionados, serviciosCatalogo]);
  // -----------------------------------

  // Usamos 'totalCalculado' en lugar de 'total'
  const totalVES = convertirDesdePrincipal(
    totalCalculado,
    "VES",
    tasas,
    monedaPrincipal
  );
  const totalCOP = convertirDesdePrincipal(
    totalCalculado,
    "COP",
    tasas,
    monedaPrincipal
  );

  return (
    <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
      <div className="text-center pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
          <FaDollarSign size={32} className="text-green-600" />
          Total de la orden
        </h2>
        <p className="text-base text-gray-600 mb-2">
          Monto final a cobrar por los servicios.
        </p>
        <p className="text-4xl font-extrabold text-green-700 tracking-tight">
          {formatearMoneda(totalCalculado, monedaPrincipal)}
        </p>
      </div>

      <div className="bg-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 text-left">
        <p className="font-bold text-gray-800 text-lg">
          Total proyectado en otras monedas:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
            <span className="text-sm text-gray-700 block mb-1">
              Bolívares (VES):
            </span>
            <span className="block text-green-700 font-bold text-xl">
              {formatearMoneda(totalVES, "VES")}
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
            <span className="text-sm text-gray-700 block mb-1">
              Pesos (COP):
            </span>
            <span className="block text-green-700 font-bold text-xl">
              {formatearMoneda(totalCOP, "COP")}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-600 italic mt-2">
          Estas proyecciones se basan en las tasas de conversión actuales.
        </p>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
        <button
          onClick={onCancelar}
          className="px-6 py-3.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <FaRegTimesCircle size={18} /> Cancelar
        </button>
        <button
          onClick={onRegistrar}
          disabled={!isFormValid || isSaving}
          className={`px-6 py-3.5 text-white rounded-lg font-semibold transition-all duration-200 ease-in-out flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
            !isFormValid || isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creando...
            </>
          ) : (
            <>
              <FaPlusCircle size={18} /> Crear Orden
            </>
          )}
        </button>
      </div>
    </section>
  );
}
