/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getClientes } from "../services/clientesService";
import FormularioCliente from "../components/formulario/FormularioCliente";
import ModalInfoCliente from "../components/modal/ModalInfoCliente";
import TablaClientes from "../components/tabla/TablaClientes";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaSearch } from "react-icons/fa";

export default function PantallaClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
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

  const clientesFiltrados = clientes.filter((c) => {
    const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
    const cedula = (c.identificacion || "").toLowerCase();
    return (
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      cedula.includes(busqueda.toLowerCase())
    );
  });

  const abrirNuevoCliente = () => {
    setClienteSeleccionado(undefined);
    setMostrarFormulario(true);
  };

  const guardarCliente = async (data: any) => {
    if (
      !data.nombre?.trim() ||
      !data.apellido?.trim() ||
      !data.telefono?.trim() ||
      !data.direccion?.trim() ||
      !data.identificacion?.trim()
    ) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      if (data.id && typeof data.id === "number") {
        await axios.put(`/api/clientes/${data.id}`, data);
        toast.success("Cliente actualizado correctamente");
      } else {
        await axios.post("/api/clientes", data);
        toast.success("Cliente registrado correctamente");
      }
      setMostrarFormulario(false);
      setClienteSeleccionado(undefined);
      cargarClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      toast.error("Error al guardar cliente");
      throw error;
    }
  };

  const eliminarCliente = async (id: number) => {
    if (!window.confirm("¿Estás segura de que deseas eliminar este cliente?"))
      return;
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={abrirNuevoCliente}
          className="bg-green-600 text-white p-3 font-bold rounded hover:bg-green-700 transition flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="relative w-72">
          <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido o cédula"
            className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
          />
        </div>
      </div>

      <TablaClientes
        clientes={clientesFiltrados}
        onVerInfo={(c: any) => setClienteInfo(c)}
        onEditar={(c: any) => {
          setClienteSeleccionado(c);
          setMostrarFormulario(true);
        }}
        onEliminar={eliminarCliente}
      />

      {mostrarFormulario && (
        <FormularioCliente
          cliente={clienteSeleccionado}
          onClose={() => setMostrarFormulario(false)}
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
