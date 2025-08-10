import { useEffect, useState } from "react";
import { clientesService } from "../../services/clientesService";
import { FaUser } from "react-icons/fa";
import type { Cliente } from "@lavanderia/shared/types/types";
import { toast } from "react-toastify";

type Props = {
  onSelect: (cliente: Cliente) => void;
  onClose: () => void;
};

export default function ListaClientesModal({ onSelect, onClose }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    setErrorCarga(null);
    clientesService
      .getAll()
      .then((res) => {
        setClientes(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar clientes:", err);
        setErrorCarga(
          "No se pudieron cargar los clientes. Inténtalo de nuevo más tarde."
        );
        toast.error("Error al cargar clientes.");
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const nombreCompleto =
      `${c.nombre} ${c.apellido} ${c.identificacion} ${c.telefono}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-6 py-4 flex justify-between items-center shadow-md rounded-t-2xl">
          <h2 className="text-xl font-extrabold flex items-center gap-3">
            <FaUser className="text-2xl" />
            Seleccionar Cliente
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-white hover:text-indigo-200 text-3xl font-bold transition-transform transform hover:rotate-90"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-6 flex-1 flex flex-col space-y-5 text-base text-gray-800">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido, identificación o teléfono"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
          />

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {cargando ? (
              <p className="text-center text-indigo-600 font-semibold py-8">
                Cargando clientes...
              </p>
            ) : errorCarga ? (
              <p className="text-center text-red-600 font-semibold py-8">
                {errorCarga}
              </p>
            ) : clientesFiltrados.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">
                No se encontraron clientes que coincidan con la búsqueda.
              </p>
            ) : (
              clientesFiltrados.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-200 rounded-lg bg-white hover:bg-indigo-50 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md cursor-pointer"
                  onClick={() => onSelect(c)}
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="font-bold text-gray-900 text-lg">
                      {c.nombre} {c.apellido}
                    </p>
                    <p className="text-sm text-gray-600">
                      {c.identificacion}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tel:</span> {c.telefono}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(c);
                    }}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
                  >
                    Seleccionar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end shadow-inner rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 ease-in-out font-semibold shadow-sm hover:shadow-md"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
