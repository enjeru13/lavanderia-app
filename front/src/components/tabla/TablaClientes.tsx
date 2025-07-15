import { FaSearch, FaPen, FaTrashAlt } from "react-icons/fa";

type Cliente = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
};

type Props = {
  clientes: Cliente[];
  onVerInfo: (cliente: Cliente) => void;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: number) => void;
};

export default function TablaClientes({
  clientes,
  onVerInfo,
  onEditar,
  onEliminar,
}: Props) {
  if (clientes.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 italic">
        No hay clientes registrados.
      </div>
    );
  }

  return (
    <table className="w-full text-sm border rounded overflow-hidden bg-white font-semibold shadow">
      <thead className="bg-gray-100 text-gray-600">
        <tr>
          <th className="px-4 py-2 text-left">Nombre</th>
          <th className="px-4 py-2 text-left">Teléfono</th>
          <th className="px-4 py-2 text-left">Email</th>
          <th className="px-4 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((c) => (
          <tr key={c.id} className="border-t hover:bg-gray-50">
            <td className="px-4 py-2">
              {c.nombre} {c.apellido}
            </td>
            <td className="px-4 py-2">{c.telefono}</td>
            <td className="px-4 py-2 max-w-[200px] truncate">
              <span title={c.email}>{c.email}</span>
            </td>
            <td className="px-4 py-2 align-top">
              <div className="grid grid-cols-3 gap-2 justify-center">
                <button
                  onClick={() => onEditar(c)}
                  title="Editar cliente"
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-0 flex items-center justify-center"
                >
                  <FaPen size={16} />
                </button>

                <button
                  onClick={() => onVerInfo(c)}
                  title="Ver información"
                  className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-0 flex items-center justify-center"
                >
                  <FaSearch size={16} />
                </button>

                <button
                  onClick={() => onEliminar(c.id)}
                  title="Eliminar cliente"
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-0 flex items-center justify-center"
                >
                  <FaTrashAlt size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
