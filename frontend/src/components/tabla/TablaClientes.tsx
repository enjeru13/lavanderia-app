import { FaSearch, FaPen, FaTrashAlt } from "react-icons/fa";
import type { Cliente } from "@lavanderia/shared/types/types";
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
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all">
        <table className="min-w-full text-sm transition-colors">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700 transition-colors">
            <tr>
              <th className="px-6 py-3 text-left">Nombre / Razón Social</th>
              <th className="px-6 py-3 text-left">Teléfono</th>
              <th className="px-6 py-3 text-left">Dirección</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic bg-white dark:bg-gray-900 transition-colors"
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
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 transition-all">
        <table className="min-w-full bg-white dark:bg-gray-900 text-sm transition-colors">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700 transition-colors">
            <tr>
              <th className="px-6 py-3 text-left">Nombre / Razón Social</th>
              <th className="px-6 py-3 text-left">Teléfono</th>
              <th className="px-6 py-3 text-left">Dirección</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr
                key={c.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 text-gray-700 dark:text-gray-300 font-medium"
              >
                <td className="px-6 py-4 text-gray-800 dark:text-gray-100 font-semibold transition-colors">
                  {c.tipo === "EMPRESA" ? (
                    <span className="font-bold text-indigo-700 dark:text-indigo-400">
                      {c.nombre}
                    </span>
                  ) : (
                    `${c.nombre} ${c.apellido}`
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-semibold transition-colors">
                  {c.telefono ?? (
                    <span className="text-gray-400 dark:text-gray-600 italic">N/A</span>
                  )}
                </td>
                <td
                  className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate font-semibold transition-colors"
                  title={c.direccion ?? undefined}
                >
                  {c.direccion ?? (
                    <span className="text-gray-400 dark:text-gray-600 italic font-semibold">
                      Sin dirección
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => onEditar(c)}
                      title="Editar cliente"
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm cursor-pointer"
                    >
                      <FaPen size={12} />
                    </button>
                    <button
                      onClick={() => onVerInfo(c)}
                      title="Ver información del cliente"
                      className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm cursor-pointer"
                    >
                      <FaSearch size={12} />
                    </button>
                    {hasRole(["ADMIN"]) && (
                      <button
                        onClick={() => onEliminar(c.id)}
                        title="Eliminar cliente"
                        className="p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm cursor-pointer"
                      >
                        <FaTrashAlt size={12} />
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
