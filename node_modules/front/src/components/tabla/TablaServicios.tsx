import { FaPen, FaTrashAlt } from "react-icons/fa";
import { formatearMoneda, type Moneda } from "../../utils/monedaHelpers";
import type { Servicio } from "@lavanderia/shared/types/types";
import { useAuth } from "../../hooks/useAuth";

type Props = {
  servicios: Servicio[];
  onEditar: (servicio: Servicio) => void;
  onEliminar: (id: number) => void;
  monedaPrincipal: Moneda;
};

export default function TablaServicios({
  servicios,
  onEditar,
  onEliminar,
  monedaPrincipal,
}: Props) {
  const { hasRole } = useAuth();

  if (servicios.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">Servicio</th>
              <th className="px-6 py-3 text-left">Precio</th>
              <th className="px-6 py-3 text-left">Descripción</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="px-6 py-10 text-center text-gray-500 italic bg-white"
              >
                No hay servicios registrados.
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
              <th className="px-6 py-3 text-left">Servicio</th>
              <th className="px-6 py-3 text-left">Precio</th>
              <th className="px-6 py-3 text-left">Descripción</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr
                key={s.id}
                className="border-t border-gray-100 hover:bg-blue-50 transition-colors duration-150 text-gray-700"
              >
                <td className="px-6 py-4 text-gray-800 font-semibold">
                  {s.nombreServicio}
                </td>
                <td className="px-6 py-4 text-indigo-700 font-extrabold">
                  {formatearMoneda(s.precioBase, monedaPrincipal)}
                </td>
                <td
                  className="px-6 py-4 text-gray-600 max-w-[250px] truncate font-semibold"
                  title={s.descripcion || undefined}
                >
                  {s.descripcion || (
                    <span className="text-gray-400 italic font-semibold">
                      Sin descripción
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex gap-2">
                    {hasRole(["ADMIN"]) && (
                      <button
                        onClick={() => onEditar(s)}
                        title="Editar servicio"
                        className="p-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                      >
                        <FaPen size={14} />
                      </button>
                    )}
                    {hasRole(["ADMIN"]) && (
                      <button
                        onClick={() => onEliminar(s.id)}
                        title="Eliminar servicio"
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
