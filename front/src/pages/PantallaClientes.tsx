// src/screens/PantallaClientes.tsx

import { useEffect, useState } from "react";
import { clientesService } from "../services/clientesService";
// Importa los tipos específicos para creación y actualización
import type { Cliente, ClienteCreate, ClienteUpdatePayload } from "../types/types";
import FormularioCliente from "../components/formulario/FormularioCliente";
import ModalInfoCliente from "../components/modal/ModalInfoCliente";
import TablaClientes from "../components/tabla/TablaClientes";
import ConfirmacionModal from "../components/modal/ConfirmacionModal"; // ✅ Necesitarás crear este componente
import { toast } from "react-toastify";
import { FaPlus, FaSearch } from "react-icons/fa";

export default function PantallaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<
    Cliente | undefined
  >();
  const [clienteInfo, setClienteInfo] = useState<Cliente | undefined>();
  // ✅ Estado para el modal de confirmación de eliminación
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [clienteAEliminarId, setClienteAEliminarId] = useState<number | undefined>();


  const cargarClientes = async () => {
    try {
      const res = await clientesService.getAll();
      setClientes(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      toast.error("Error al cargar clientes");
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
    const cedula = (c.identificacion || "").toLowerCase(); // Usar || "" para seguridad
    return (
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      cedula.includes(busqueda.toLowerCase())
    );
  });

  const abrirNuevoCliente = () => {
    setClienteSeleccionado(undefined); // Para un nuevo cliente, no hay cliente seleccionado
    setMostrarFormulario(true);
  };

  // ✅ Firma de la función guardarCliente para aceptar los tipos correctos
  const guardarCliente = async (data: ClienteCreate | (ClienteUpdatePayload & { id: number })) => {
    try {
      if ('id' in data && data.id) { // Si 'id' existe en los datos, es una actualización
        // Asegúrate de que data sea compatible con ClienteUpdatePayload
        await clientesService.update(data.id, data as ClienteUpdatePayload);
        toast.success("Cliente actualizado correctamente");
      } else {
        // Si no hay 'id', es una creación
        // Asegúrate de que data sea compatible con ClienteCreate
        await clientesService.create(data as ClienteCreate);
        toast.success("Cliente registrado correctamente");
      }
      setMostrarFormulario(false);
      setClienteSeleccionado(undefined);
      cargarClientes(); // Recargar la lista de clientes
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      toast.error("Error al guardar cliente");
    }
  };

  // ✅ Función para iniciar el proceso de eliminación (abrir modal)
  const confirmarEliminarCliente = (id: number) => {
    setClienteAEliminarId(id);
    setMostrarConfirmacionEliminar(true);
  };

  // ✅ Función que se ejecuta al confirmar la eliminación en el modal
  const ejecutarEliminarCliente = async () => {
    if (clienteAEliminarId === undefined) return; // No debería pasar si el modal se abre correctamente

    try {
      await clientesService.delete(clienteAEliminarId);
      toast.success("Cliente eliminado correctamente");
      cargarClientes(); // Recargar la lista de clientes
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar cliente");
    } finally {
      setMostrarConfirmacionEliminar(false); // Cerrar el modal
      setClienteAEliminarId(undefined); // Limpiar el ID
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
        onVerInfo={(c) => setClienteInfo(c)}
        onEditar={(c) => {
          setClienteSeleccionado(c);
          setMostrarFormulario(true);
        }}
        onEliminar={confirmarEliminarCliente}
      />

      {mostrarFormulario && (
        <FormularioCliente
          cliente={clienteSeleccionado} // Será Cliente para editar, undefined para crear
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

      {/* ✅ Modal de Confirmación de Eliminación */}
      {mostrarConfirmacionEliminar && (
        <ConfirmacionModal
          mensaje="¿Estás segura de que deseas eliminar este cliente? Esta acción no se puede deshacer."
          onConfirm={ejecutarEliminarCliente}
          onCancel={() => {
            setMostrarConfirmacionEliminar(false);
            setClienteAEliminarId(undefined);
          }}
        />
      )}
    </div>
  );
}
