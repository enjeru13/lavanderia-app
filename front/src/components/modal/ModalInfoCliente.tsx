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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">
          Detalles del Cliente
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Nombre:</span> {cliente.nombre}{" "}
            {cliente.apellido}
          </div>
          <div>
            <span className="font-semibold">Cédula:</span> {cliente.identificacion}
          </div>
          <div>
            <span className="font-semibold">Teléfono:</span> {cliente.telefono}
          </div>
          <div>
            <span className="font-semibold">Correo:</span> {cliente.email}
          </div>
          <div>
            <span className="font-semibold">Dirección:</span>{" "}
            {cliente.direccion}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
