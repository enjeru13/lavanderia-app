/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getClientes } from "../../services/clientesService";
import { FaUser } from "react-icons/fa";

type Props = {
  onSelect: (cliente: any) => void;
  onClose: () => void;
};

export default function ListaClientesModal({ onSelect, onClose }: Props) {
  const [clientes, setClientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    getClientes()
      .then((res) => setClientes(res.data))
      .catch((err) => console.error("Error al cargar clientes:", err));
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] shadow-xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-700">
            <FaUser /> Seleccionar Cliente
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Búsqueda */}
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o apellido"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200 mb-4"
        />

        {/* Lista de clientes */}
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {clientesFiltrados.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center">
              No se encontraron clientes.
            </p>
          ) : (
            clientesFiltrados.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center border px-3 py-2 rounded hover:bg-blue-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {c.nombre} {c.apellido}
                  </p>
                  <p className="text-sm text-gray-600">{c.telefono}</p>
                </div>
                <button
                  onClick={() => onSelect(c)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm font-medium"
                >
                  Seleccionar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
