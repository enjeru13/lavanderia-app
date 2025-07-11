import { FaPen, FaTrashAlt } from "react-icons/fa";

type Servicio = {
  id: number;
  nombreServicio: string;
  precioBase: number;
  descripcion?: string;
};

type Props = {
  servicios: Servicio[];
  onEditar: (servicio: Servicio) => void;
  onEliminar: (id: number) => void;
};

export default function TablaServicios({
  servicios,
  onEditar,
  onEliminar,
}: Props) {
  if (servicios.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 italic">
        No hay servicios registrados.
      </div>
    );
  }

  return (
    <table className="w-full bg-white shadow rounded text-sm overflow-hidden">
      <thead className="bg-gray-100 text-gray-600">
        <tr>
          <th className="px-4 py-2 text-left">Servicio</th>
          <th className="px-4 py-2 text-left">Precio</th>
          <th className="px-4 py-2 text-left">Descripción</th>
          <th className="px-4 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {servicios.map((s) => (
          <tr key={s.id} className="border-t hover:bg-gray-50">
            <td className="px-4 py-2">{s.nombreServicio}</td>
            <td className="px-4 py-2">${s.precioBase.toFixed(2)}</td>
            <td className="px-4 py-2 text-gray-600 max-w-[200px] truncate">
              <span title={s.descripcion || "—"}>{s.descripcion || "—"}</span>
            </td>
            <td className="p-6">
              <div className="grid grid-cols-2 gap-2 justify-center">
                <button
                  onClick={() => onEditar(s)}
                  title="Editar servicio"
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-0 flex items-center justify-center"
                >
                  <FaPen size={16} />
                </button>

                <button
                  onClick={() => onEliminar(s.id)}
                  title="Eliminar servicio"
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
