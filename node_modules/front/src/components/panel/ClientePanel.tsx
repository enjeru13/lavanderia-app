import { FaUserPlus, FaUserCheck, FaUser } from "react-icons/fa";
import type { ClienteResumen } from "../../../../shared/types/types";

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
    <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
      <header className="pb-4 border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FaUser size={28} className="text-indigo-500" />
          Cliente
        </h2>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          {cliente ? (
            <div className="bg-green-100 border border-green-400 text-green-800 px-5 py-2.5 rounded-lg font-bold inline-flex items-center gap-3 shadow-sm">
              <FaUserCheck className="text-green-600 text-xl" />
              {cliente.nombre} {cliente.apellido}
            </div>
          ) : (
            <div className="text-gray-600 italic px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg inline-flex items-center gap-2">
              No hay cliente asignado
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onAbrirFormulario}
            className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
          >
            <FaUserPlus />
            Registrar nuevo
          </button>
          <button
            onClick={onAbrirLista}
            className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-gray-800 bg-gray-200 hover:bg-gray-300 border border-gray-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
          >
            <FaUserCheck />
            Seleccionar existente
          </button>
        </div>
      </div>
    </section>
  );
}
