import { useEffect, useState, useMemo, useCallback } from "react";
import { clientesService } from "../services/clientesService";
import type {
  Cliente,
  ClienteCreate,
  ClienteUpdatePayload,
} from "@lavanderia/shared/types/types";
import FormularioCliente from "../components/formulario/FormularioCliente";
import ModalInfoCliente from "../components/modal/ModalInfoCliente";
import TablaClientes from "../components/tabla/TablaClientes";
import ConfirmacionModal from "../components/modal/ConfirmacionModal";
import { toast } from "react-toastify";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import ControlesPaginacion from "../components/ControlesPaginacion";

export default function PantallaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<
    Cliente | undefined
  >();
  const [clienteInfo, setClienteInfo] = useState<Cliente | undefined>();
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] =
    useState(false);
  const [clienteAEliminarId, setClienteAEliminarId] = useState<
    number | undefined
  >();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);

  const { hasRole } = useAuth();

  const cargarClientes = useCallback(async () => {
    try {
      const res = await clientesService.getAll();
      setClientes(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      toast.error("Error al cargar clientes");
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  const clientesFiltradosYPaginados = useMemo(() => {
    const clientesProcesados = clientes.filter((c) => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
      const cedula = (c.identificacion || "").toLowerCase();
      const telefono = (c.telefono || "").toLowerCase();
      const terminoBusqueda = busqueda.toLowerCase();

      return (
        nombreCompleto.includes(terminoBusqueda) ||
        cedula.includes(terminoBusqueda) ||
        telefono.includes(terminoBusqueda)
      );
    });

    setTotalFilteredItems(clientesProcesados.length);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return clientesProcesados.slice(startIndex, endIndex);
  }, [clientes, busqueda, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalFilteredItems / itemsPerPage);
  }, [totalFilteredItems, itemsPerPage]);

  const abrirNuevoCliente = useCallback(() => {
    if (hasRole(["ADMIN", "EMPLOYEE"])) {
      setClienteSeleccionado(undefined);
      setMostrarFormulario(true);
    } else {
      toast.error("No tienes permiso para registrar nuevos clientes.");
    }
  }, [hasRole]);

  const guardarCliente = useCallback(
    async (data: ClienteCreate | (ClienteUpdatePayload & { id: number })) => {
      try {
        if ("id" in data && data.id) {
          await clientesService.update(data.id, data as ClienteUpdatePayload);
          toast.success("Cliente actualizado correctamente");
        } else {
          await clientesService.create(data as ClienteCreate);
          toast.success("Cliente registrado correctamente");
        }
        setMostrarFormulario(false);
        setClienteSeleccionado(undefined);
        cargarClientes();
      } catch (error) {
        console.error("Error al guardar cliente:", error);
        toast.error("Error al guardar cliente");
      }
    },
    [cargarClientes]
  );

  const handleEditarCliente = useCallback(
    (cliente: Cliente) => {
      if (hasRole(["ADMIN", "EMPLOYEE"])) {
        setClienteSeleccionado(cliente);
        setMostrarFormulario(true);
      } else {
        toast.error("No tienes permiso para editar clientes.");
      }
    },
    [hasRole]
  );

  const handleEliminarCliente = useCallback(
    (id: number) => {
      if (hasRole(["ADMIN"])) {
        setClienteAEliminarId(id);
        setMostrarConfirmacionEliminar(true);
      } else {
        toast.error("No tienes permiso para eliminar clientes.");
      }
    },
    [hasRole]
  );

  const ejecutarEliminarCliente = useCallback(async () => {
    if (clienteAEliminarId === undefined) return;

    try {
      await clientesService.delete(clienteAEliminarId);
      toast.success("Cliente eliminado correctamente");
      cargarClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar cliente");
    } finally {
      setMostrarConfirmacionEliminar(false);
      setClienteAEliminarId(undefined);
    }
  }, [clienteAEliminarId, cargarClientes]);

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

      <div className="mb-5 flex items-center gap-3 font-semibold">
        <div className="flex flex-col">
          <label
            htmlFor="filtroBusquedaCliente"
            className="text-xs text-gray-500 mb-1"
          >
            Buscar por Nombre, Apellido, Cédula o Teléfono
          </label>
          <div className="relative w-72">
            <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
            <input
              type="text"
              id="filtroBusquedaCliente"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, apellido, cédula o teléfono"
              className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
            />
          </div>
        </div>
      </div>

      {clientesFiltradosYPaginados.length === 0 && totalFilteredItems > 0 ? (
        <p className="text-gray-500">
          No se encontraron clientes en esta página con los filtros aplicados.
        </p>
      ) : clientesFiltradosYPaginados.length === 0 &&
        totalFilteredItems === 0 ? (
        <p className="text-gray-500">
          No se encontraron clientes con los filtros aplicados.
        </p>
      ) : (
        <>
          <TablaClientes
            clientes={clientesFiltradosYPaginados}
            onVerInfo={(c) => setClienteInfo(c)}
            onEditar={handleEditarCliente}
            onEliminar={handleEliminarCliente}
          />
          {totalPages > 1 && (
            <ControlesPaginacion
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

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
