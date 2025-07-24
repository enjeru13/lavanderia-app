import { FaUser } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import type { Cliente } from "../../../../shared/types/types";

type Props = {
  cliente: Cliente;
  onClose: () => void;
};

export default function ModalInfoCliente({ cliente, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 space-y-7 text-base font-medium transform transition-all duration-300 scale-100 opacity-100 ring-1 ring-gray-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-extrabold text-indigo-700 flex items-center gap-3">
            <FaUser className="text-2xl sm:text-3xl" />
            Detalles del cliente
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-transform transform hover:rotate-90"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-5 text-gray-800">
          <div>
            <p className="text-xs text-gray-600 font-semibold mb-1">
              Nombre completo
            </p>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 font-semibold text-gray-900 shadow-sm">
              {cliente.nombre} {cliente.apellido}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Cédula</p>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-gray-900 shadow-sm">
              {cliente.identificacion}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Teléfono</p>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-gray-900 shadow-sm">
              {cliente.telefono}
            </div>
          </div>

          {cliente.telefono_secundario && (
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">
                Teléfono secundario
              </p>
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-gray-900 shadow-sm">
                {cliente.telefono_secundario}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-600 font-semibold mb-1">
              Correo electrónico
            </p>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-gray-900 shadow-sm">
              {cliente.email ?? "—"}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-semibold mb-1">
              Dirección
            </p>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-gray-900 shadow-sm">
              {cliente.direccion}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-base font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
