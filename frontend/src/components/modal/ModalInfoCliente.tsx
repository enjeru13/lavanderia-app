import { FaUser } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import type { Cliente } from "@lavanderia/shared/types/types";

type Props = {
  cliente: Cliente;
  onClose: () => void;
};

export default function ModalInfoCliente({ cliente, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4 sm:p-6 transition-all">
      <div className="bg-white dark:bg-gray-950 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 sm:p-8 space-y-7 text-base font-medium transform transition-all duration-300 scale-100 opacity-100 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <h2 className="text-xl sm:text-2xl font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-3">
            <FaUser className="text-2xl sm:text-3xl" />
            Detalles del cliente
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-3xl font-bold transition-transform transform hover:rotate-90 cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-5 text-gray-800 dark:text-gray-200 transition-colors">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
              Nombre completo
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-gray-100 shadow-sm transition-all">
              {cliente.nombre} {cliente.apellido}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">Cédula</p>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all">
              {cliente.identificacion}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">Teléfono</p>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all">
              {cliente.telefono}
            </div>
          </div>

          {cliente.telefono_secundario && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
                Teléfono secundario
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all">
                {cliente.telefono_secundario}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
              Correo electrónico
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all">
              {cliente.email ?? "—"}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
              Dirección
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all">
              {cliente.direccion}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800 transition-colors">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg text-base font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
