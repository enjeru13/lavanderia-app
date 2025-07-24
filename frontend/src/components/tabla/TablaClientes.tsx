import { FaSearch, FaPen, FaTrashAlt } from "react-icons/fa";
import type { Cliente } from "../../../../shared/types/types";
import { useAuth } from "../../hooks/useAuth";

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
  const { hasRole } = useAuth();

  if (clientes.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Teléfono</th>
              <th className="px-6 py-3 text-left">Dirección</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="px-6 py-10 text-center text-gray-500 italic bg-white"
              >
                No hay clientes registrados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Teléfono</th>
              <th className="px-6 py-3 text-left">Dirección</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr
                key={c.id}
                className="border-t border-gray-100 hover:bg-blue-50 transition-colors duration-150 text-gray-700"
              >
                <td className="px-6 py-4 text-gray-800 font-semibold">
                  {c.nombre} {c.apellido}
                </td>
                <td className="px-6 py-4 text-gray-600 font-semibold">
                  {c.telefono ?? (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </td>
                <td
                  className="px-6 py-4 text-gray-500 max-w-[200px] truncate font-semibold"
                  title={c.direccion ?? undefined}
                >
                  {c.direccion ?? (
                    <span className="text-gray-400 italic font-semibold">
                      Sin dirección
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => onEditar(c)}
                      title="Editar cliente"
                      className="p-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                    >
                      <FaPen size={14} />
                    </button>
                    <button
                      onClick={() => onVerInfo(c)}
                      title="Ver información del cliente"
                      className="p-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                    >
                      <FaSearch size={14} />
                    </button>
                    {hasRole(["ADMIN"]) && (
                      <button
                        onClick={() => onEliminar(c.id)}
                        title="Eliminar cliente"
                        className="p-2 bg-red-100 border border-red-300 text-red-700 rounded-md hover:bg-red-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
