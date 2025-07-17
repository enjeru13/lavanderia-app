import { FaUser } from "react-icons/fa";

type Props = {
  cliente: {
    nombre: string;
    apellido: string;
    identificacion: string;
    telefono: string;
    telefono_secundario?: string;
    direccion: string;
    email: string;
  };
  onClose: () => void;
};

export default function ModalInfoCliente({ cliente, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 space-y-6 text-sm font-medium">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
            <FaUser />
            Detalles del cliente
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Información */}
        <div className="space-y-4 text-gray-700">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nombre completo</p>
            <p className="font-semibold">
              {cliente.nombre} {cliente.apellido}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Cédula</p>
            <p>{cliente.identificacion}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Teléfono</p>
            <p>{cliente.telefono}</p>
          </div>

          {cliente.telefono_secundario && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Teléfono secundario</p>
              <p>{cliente.telefono_secundario}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1">Correo electrónico</p>
            <p>{cliente.email}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Dirección</p>
            <p>{cliente.direccion}</p>
          </div>
        </div>

        {/* Acción */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
