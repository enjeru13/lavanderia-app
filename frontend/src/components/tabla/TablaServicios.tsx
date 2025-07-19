import { FaPen, FaTrashAlt } from "react-icons/fa";
import { formatearMoneda, type Moneda } from "../../utils/monedaHelpers";
import type { Servicio } from "../../types/types";

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
  if (servicios.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 italic">
        No hay servicios registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm font-semibold rounded-xl shadow-md">
        <thead className="bg-gray-100 text-gray-600">
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
              className="border-t hover:bg-gray-50 transition-colors duration-100"
            >
              <td className="px-6 py-4 text-gray-800">{s.nombreServicio}</td>
              <td className="px-6 py-4 text-indigo-600 font-semibold">
                {formatearMoneda(s.precioBase, monedaPrincipal)}{" "}
              </td>
              <td className="px-6 py-4 text-gray-500 max-w-[250px] truncate">
                <span title={s.descripcion || "—"}>{s.descripcion || "—"}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="inline-flex gap-2">
                  <button
                    onClick={() => onEditar(s)}
                    title="Editar servicio"
                    className="px-2 py-2 bg-blue-50 border border-blue-400 text-blue-700 rounded-md hover:bg-blue-100 transition"
                  >
                    <FaPen size={14} />
                  </button>
                  <button
                    onClick={() => onEliminar(s.id)}
                    title="Eliminar servicio"
                    className="px-2 py-2 bg-red-50 border border-red-400 text-red-700 rounded-md hover:bg-red-100 transition"
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
