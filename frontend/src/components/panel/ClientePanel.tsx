import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import type { ClienteResumen } from "../../types/types";

type Props = {
  cliente: ClienteResumen | null;
  onAbrirFormulario: () => void;
  onAbrirLista: () => void;
};

export default function ClientePanel({
  cliente,
  onAbrirFormulario,
  onAbrirLista,
}: Props) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-lg space-y-5">
      <header>
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          Cliente
        </h2>
        <p className="text-sm text-gray-500">
          Asocia un cliente nuevo o existente con esta orden.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Estado del cliente */}
        <div>
          {cliente ? (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded font-semibold inline-flex items-center gap-2">
              <FaUserCheck className="text-green-600" />
              {cliente.nombre} {cliente.apellido}
            </div>
          ) : (
            <div className="text-gray-500 italic">No hay cliente asignado</div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={onAbrirFormulario}
            className="px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
          >
            <FaUserPlus />
            Registrar nuevo
          </button>
          <button
            onClick={onAbrirLista}
            className="px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 border border-gray-600 text-gray-600 hover:bg-gray-100 transition"
          >
            <FaUserCheck />
            Seleccionar existente
          </button>
        </div>
      </div>
    </section>
  );
}
