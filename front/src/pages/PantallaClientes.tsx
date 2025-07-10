/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getClientes } from "../services/clientes";
import FormularioCliente from "../components/FormularioCliente";
import ModalInfoCliente from "../components/ModalInfoCliente";
import axios from "axios";
import { toast } from "react-toastify";

export default function ListaClientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<any>(undefined);
  const [clienteInfo, setClienteInfo] = useState<any>(undefined);

  const cargarClientes = () => {
    getClientes()
      .then((res) => setClientes(res.data))
      .catch((err) => {
        console.error("Error al cargar clientes:", err);
        toast.error("Error al cargar clientes");
      });
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const abrirNuevoCliente = () => {
    setClienteSeleccionado(undefined);
    setMostrarModal(true);
  };

  const editarCliente = (cliente: any) => {
    setClienteSeleccionado(cliente);
    setMostrarModal(true);
  };

  const verCliente = (cliente: any) => {
    setClienteInfo(cliente);
  };

  const guardarCliente = async (data: any) => {
    try {
      if (data.id) {
        await axios.put(`/api/clientes/${data.id}`, data);
        toast.success("Cliente actualizado correctamente");
      } else {
        await axios.post("/api/clientes", data);
        toast.success("Cliente registrado correctamente");
      }
      setMostrarModal(false);
      setClienteSeleccionado(undefined);
      cargarClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      toast.error("Error al guardar cliente");
      throw error;
    }
  };

  const eliminarCliente = async (id: number) => {
    const confirmado = window.confirm(
      "¿Estás seguro de que deseas eliminar este cliente?"
    );
    if (!confirmado) return;

    try {
      await axios.delete(`/api/clientes/${id}`);
      toast.success("Cliente eliminado correctamente");
      cargarClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar cliente");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={abrirNuevoCliente}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Nuevo Cliente
        </button>
      </div>

      <table className="w-full bg-white shadow rounded table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Teléfono</th>
            <th className="px-4 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c: any) => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">
                {c.nombre} {c.apellido}
              </td>
              <td className="px-4 py-2">{c.telefono}</td>
              <td className="px-4 py-2 text-right">
                <div className="inline-flex gap-2">
                  <button
                    onClick={() => editarCliente(c)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => verCliente(c)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => eliminarCliente(c.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarModal && (
        <FormularioCliente
          cliente={clienteSeleccionado}
          onClose={() => setMostrarModal(false)}
          onSubmit={guardarCliente}
        />
      )}

      {clienteInfo && (
        <ModalInfoCliente
          cliente={clienteInfo}
          onClose={() => setClienteInfo(undefined)}
        />
      )}
    </div>
  );
}
