import {
  formatearMoneda,
  convertirDesdePrincipal,
  type Moneda,
  type TasasConversion,
} from "../../utils/monedaHelpers";
import { FaTimes } from "react-icons/fa";

interface Props {
  total: number;
  onRegistrar: () => void;
  onCancelar: () => void;
  monedaPrincipal: Moneda;
  tasas: TasasConversion;
}

export default function ConfirmarOrdenPanel({
  total,
  onRegistrar,
  onCancelar,
  monedaPrincipal,
  tasas,
}: Props) {
  const totalVES = convertirDesdePrincipal(
    total,
    "VES",
    tasas,
    monedaPrincipal
  );
  const totalCOP = convertirDesdePrincipal(
    total,
    "COP",
    tasas,
    monedaPrincipal
  );

  return (
    <section className="bg-white p-6 rounded-xl shadow-lg font-medium space-y-4 text-right">
      <div>
        <p className="text-sm text-gray-500 mb-1">Total de la orden</p>
        <p className="text-2xl font-bold text-green-700 tracking-tight">
          {formatearMoneda(total, monedaPrincipal)}{" "}
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-300 rounded-md p-4 shadow-sm ring-1 ring-gray-100 space-y-3 text-left">
        <p className="font-semibold text-gray-700">
          Total proyectado en otras monedas
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500">Bolívares (VES):</span>
            <span className="block text-green-700 font-semibold">
              {formatearMoneda(totalVES, "VES")}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Pesos (COP):</span>
            <span className="block text-green-700 font-semibold">
              {formatearMoneda(totalCOP, "COP")}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 italic">
          Estas proyecciones se basan en las tasas de conversión actuales.
        </p>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={onCancelar}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 font-semibold"
        >
          <FaTimes /> Cancelar
        </button>
        <button
          onClick={onRegistrar}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold"
        >
          Crear Orden
        </button>
      </div>
    </section>
  );
}
