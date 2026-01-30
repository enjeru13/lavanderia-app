import { FaUserPlus, FaUserCheck, FaUser } from "react-icons/fa";
import type { ClienteResumen } from "@lavanderia/shared/types/types";

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
    <section className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 space-y-6 transition-all duration-300">
      <header className="pb-4 border-b border-gray-200 dark:border-gray-800 mb-6 transition-colors">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <FaUser size={28} className="text-indigo-500 dark:text-indigo-400" />
          Cliente
        </h2>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 transition-all">
        <div>
          {cliente ? (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-800 dark:text-green-400 px-5 py-2.5 rounded-lg font-bold inline-flex items-center gap-3 shadow-sm transition-colors">
              <FaUserCheck className="text-green-600 dark:text-green-500 text-xl" />
              {cliente.nombre} {cliente.apellido}
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400 italic px-5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg inline-flex items-center gap-2 transition-colors">
              No hay cliente asignado
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onAbrirFormulario}
            className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer active:scale-95"
          >
            <FaUserPlus />
            Registrar nuevo
          </button>
          <button
            onClick={onAbrirLista}
            className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer active:scale-95"
          >
            <FaUserCheck />
            Seleccionar existente
          </button>
        </div>
      </div>
    </section>
  );
}
