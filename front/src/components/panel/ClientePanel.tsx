import { FaUserPlus, FaUserCheck } from "react-icons/fa";

type Props = {
  cliente: { nombre: string; apellido: string } | null;
  onAbrirFormulario: () => void;
  onAbrirLista: () => void;
};

export default function ClientePanel({
  cliente,
  onAbrirFormulario,
  onAbrirLista,
}: Props) {
  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-3">Cliente</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {cliente ? (
            <span className="p-3 bg-green-100 rounded text-green-800 font-semibold inline-flex items-center gap-2">
              <FaUserCheck className="text-green-600 text-lg" />
              {cliente.nombre} {cliente.apellido}
            </span>
          ) : (
            <span className="text-gray-500 italic">
              No hay cliente asignado
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAbrirFormulario}
            className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-0 flex items-center justify-center"
            title="Registrar nuevo cliente"
          >
            <FaUserPlus size={18} />
          </button>
          <button
            onClick={onAbrirLista}
            className="p-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-0 flex items-center justify-center"
            title="Seleccionar cliente existente"
          >
            <FaUserCheck size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
