import { useEffect, useState } from "react";
import { clientesService } from "../../services/clientesService";
import { FaUser } from "react-icons/fa";
import type { Cliente } from "../../../../shared/types/types";

type Props = {
  onSelect: (cliente: Cliente) => void;
  onClose: () => void;
};

export default function ListaClientesModal({ onSelect, onClose }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    clientesService
      .getAll()
      .then((res) => setClientes(res.data))
      .catch((err) => console.error("Error al cargar clientes:", err));
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg space-y-5 text-sm font-medium">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
            <FaUser />
            Seleccionar cliente
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Buscador */}
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o apellido"
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
        />

        {/* Lista */}
        <div className="max-h-[300px] overflow-y-auto space-y-3">
          {clientesFiltrados.length === 0 ? (
            <p className="text-gray-500 italic text-center">
              No se encontraron clientes.
            </p>
          ) : (
            clientesFiltrados.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:bg-indigo-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {c.nombre} {c.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{c.telefono}</p>
                </div>
                <button
                  onClick={() => onSelect(c)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-semibold"
                >
                  Seleccionar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
