import { useState } from "react";
import ModalContraseña from "../modal/ModalContraseña";
import { FaSearch, FaPen, FaTrashAlt } from "react-icons/fa";

type Cliente = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
};

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
  const [mostrarProteccionCliente, setMostrarProteccionCliente] =
    useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(
    null
  );
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null);
  const [mostrarProteccionEditar, setMostrarProteccionEditar] = useState(false);

  if (clientes.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 italic">
        No hay clientes registrados.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm font-semibold rounded-xl shadow-md border overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Teléfono</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-gray-50 transition-colors duration-100"
              >
                <td className="px-6 py-4 text-gray-800 font-semibold">
                  {c.nombre} {c.apellido}
                </td>
                <td className="px-6 py-4 text-gray-600">{c.telefono}</td>
                <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                  <span title={c.email}>{c.email}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => {
                        setClienteAEditar(c);
                        setMostrarProteccionEditar(true);
                      }}
                      title="Editar cliente"
                      className="px-2 py-2 bg-blue-50 border border-blue-400 text-blue-700 rounded-md hover:bg-blue-100 transition"
                    >
                      <FaPen size={14} />
                    </button>
                    <button
                      onClick={() => onVerInfo(c)}
                      title="Ver información"
                      className="px-2 py-2 bg-gray-50 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
                    >
                      <FaSearch size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setClienteAEliminar(c);
                        setMostrarProteccionCliente(true);
                      }}
                      title="Eliminar cliente"
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

      <ModalContraseña
        visible={mostrarProteccionCliente}
        onCancelar={() => {
          setMostrarProteccionCliente(false);
          setClienteAEliminar(null);
        }}
        onConfirmado={() => {
          if (clienteAEliminar) {
            onEliminar(clienteAEliminar.id);
          }
          setMostrarProteccionCliente(false);
          setClienteAEliminar(null);
        }}
        titulo={`Eliminar cliente ${clienteAEliminar?.nombre ?? ""} ${
          clienteAEliminar?.apellido ?? ""
        }`}
      />
      <ModalContraseña
        visible={mostrarProteccionEditar}
        onCancelar={() => {
          setMostrarProteccionEditar(false);
          setClienteAEditar(null);
        }}
        onConfirmado={() => {
          if (clienteAEditar) {
            onEditar(clienteAEditar);
          }
          setMostrarProteccionEditar(false);
          setClienteAEditar(null);
        }}
        titulo={`Editar cliente ${clienteAEditar?.nombre ?? ""} ${
          clienteAEditar?.apellido ?? ""
        }`}
      />
    </>
  );
}
