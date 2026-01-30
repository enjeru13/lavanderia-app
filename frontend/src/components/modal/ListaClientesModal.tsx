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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 sm:p-6 transition-all">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-800 transition-all">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-indigo-800 dark:from-indigo-800 dark:to-indigo-950 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl shadow-md transition-all">
          <h2 className="text-xl font-extrabold flex items-center gap-3">
            <FaUser className="text-2xl" />
            Seleccionar Cliente
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-white hover:text-indigo-200 dark:hover:text-indigo-400 text-3xl font-bold transition-transform transform hover:rotate-90 cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex-1 flex flex-col space-y-5 text-base text-gray-800 dark:text-gray-200 overflow-hidden transition-colors">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido, identificación o teléfono"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
          />

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {cargando ? (
              <p className="text-center text-indigo-600 dark:text-indigo-400 font-semibold py-8">
                Cargando clientes...
              </p>
            ) : errorCarga ? (
              <p className="text-center text-red-600 dark:text-red-400 font-semibold py-8">
                {errorCarga}
              </p>
            ) : clientesFiltrados.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-500 italic text-center py-8">
                No se encontraron clientes que coincidan con la búsqueda.
              </p>
            ) : (
              clientesFiltrados.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md cursor-pointer"
                  onClick={() => onSelect(c)}
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-lg transition-colors">
                      {c.nombre} {c.apellido}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{c.identificacion}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      <span className="font-medium">Tel:</span> {c.telefono}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(c);
                    }}
                    className="px-5 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer active:scale-95"
                  >
                    Seleccionar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex justify-end shadow-inner rounded-b-2xl transition-all">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out font-semibold shadow-sm hover:shadow-md cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
