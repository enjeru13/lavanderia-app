import { FaUser } from "react-icons/fa";

type Props = {
  cliente: {
    nombre: string;
    apellido: string;
    identificacion: string;
    telefono: string;
    direccion: string;
    email: string;
  };
  onClose: () => void;
};

export default function ModalInfoCliente({ cliente, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg font-semibold shadow-xl w-[420px] p-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-700">
            <FaUser /> Detalles del Cliente
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Nombre:</span> {cliente.nombre}{" "}
            {cliente.apellido}
          </p>
          <p>
            <span className="font-semibold">Cédula:</span>{" "}
            {cliente.identificacion}
          </p>
          <p>
            <span className="font-semibold">Teléfono:</span> {cliente.telefono}
          </p>
          <p>
            <span className="font-semibold">Correo:</span> {cliente.email}
          </p>
          <p>
            <span className="font-semibold">Dirección:</span>{" "}
            {cliente.direccion}
          </p>
        </div>

        {/* Acción */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 text-sm font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
