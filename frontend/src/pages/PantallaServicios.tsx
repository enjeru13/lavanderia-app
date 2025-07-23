import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaSearch } from "react-icons/fa";
import TablaServicios from "../components/tabla/TablaServicios";
import FormularioServicio from "../components/formulario/FormularioServicio";
import ConfirmacionModal from "../components/modal/ConfirmacionModal";
import { servicioService } from "../services/serviciosService";
import { configuracionService } from "../services/configuracionService";
import { useAuth } from "../hooks/useAuth";
import type {
  Servicio,
  ServicioCreate,
  ServicioUpdatePayload,
  Moneda,
} from "../../../shared/types/types";

export default function PantallaServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<
    Servicio | undefined
  >();

  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] =
    useState(false);
  const [servicioAEliminarId, setServicioAEliminarId] = useState<
    number | undefined
  >();

  const [monedaPrincipal, setMonedaPrincipal] = useState<Moneda>("USD");

  const { hasRole } = useAuth();

  const cargarServicios = async () => {
    try {
      const res = await servicioService.getAll();
      setServicios(res.data || []);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      toast.error("No se pudieron cargar los servicios");
    }
  };

  const cargarConfiguracion = async () => {
    try {
      const res = await configuracionService.get();
      setMonedaPrincipal(res.data.monedaPrincipal);
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      toast.error("Error al cargar la configuración de moneda.");
    }
  };

  useEffect(() => {
    cargarServicios();
    cargarConfiguracion();
  }, []);

  const serviciosFiltrados = servicios.filter((s) => {
    const nombre = s.nombreServicio.toLowerCase();
    const descripcion = (s.descripcion || "").toLowerCase();
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      nombre.includes(terminoBusqueda) || descripcion.includes(terminoBusqueda)
    );
  });

  const abrirNuevoServicio = () => {
    if (hasRole(["ADMIN", "EMPLOYEE"])) {
      setServicioSeleccionado(undefined);
      setMostrarFormulario(true);
    } else {
      toast.error("No tienes permiso para registrar nuevos servicios.");
    }
  };

  const handleEditarServicio = (servicio: Servicio) => {
    if (hasRole(["ADMIN", "EMPLOYEE"])) {
      setServicioSeleccionado(servicio);
      setMostrarFormulario(true);
    } else {
      toast.error("No tienes permiso para editar servicios.");
    }
  };

  const guardarServicio = async (
    data: ServicioCreate | (ServicioUpdatePayload & { id: number })
  ) => {
    try {
      if ("id" in data && data.id) {
        await servicioService.update(data.id, data as ServicioUpdatePayload);
        toast.success("Servicio actualizado correctamente");
      } else {
        await servicioService.create(data as ServicioCreate);
        toast.success("Servicio registrado correctamente");
      }
      setMostrarFormulario(false);
      setServicioSeleccionado(undefined);
      cargarServicios();
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      toast.error("Error al guardar servicio");
    }
  };

  const handleEliminarServicio = (id: number) => {
    if (hasRole(["ADMIN"])) {
      setServicioAEliminarId(id);
      setMostrarConfirmacionEliminar(true);
    } else {
      toast.error("No tienes permiso para eliminar servicios.");
    }
  };

  const ejecutarEliminarServicio = async () => {
    if (servicioAEliminarId === undefined) return;

    try {
      await servicioService.delete(servicioAEliminarId);
      toast.success("Servicio eliminado correctamente");
      cargarServicios();
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      toast.error("Error al eliminar servicio");
    } finally {
      setMostrarConfirmacionEliminar(false);
      setServicioAEliminarId(undefined);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
        <button
          onClick={abrirNuevoServicio}
          className="bg-green-600 text-white p-3 font-bold rounded hover:bg-green-700 transition flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3 font-semibold">
        <div className="flex flex-col">
          <label
            htmlFor="filtroBusquedaServicio"
            className="text-xs text-gray-500 mb-1"
          >
            Buscar por Nombre o Descripción
          </label>
          <div className="relative w-72">
            <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
            <input
              type="text"
              id="filtroBusquedaServicio"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre o descripción del servicio"
              className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
            />
          </div>
        </div>
      </div>

      <TablaServicios
        servicios={serviciosFiltrados}
        onEditar={handleEditarServicio}
        onEliminar={handleEliminarServicio}
        monedaPrincipal={monedaPrincipal}
      />

      {mostrarFormulario && (
        <FormularioServicio
          servicio={servicioSeleccionado}
          onClose={() => {
            setMostrarFormulario(false);
            setServicioSeleccionado(undefined);
          }}
          onSubmit={guardarServicio}
        />
      )}

      {mostrarConfirmacionEliminar && (
        <ConfirmacionModal
          mensaje="¿Estás segura de que deseas eliminar este servicio? Esta acción no se puede deshacer."
          onConfirm={ejecutarEliminarServicio}
          onCancel={() => {
            setMostrarConfirmacionEliminar(false);
            setServicioAEliminarId(undefined);
          }}
        />
      )}
    </div>
  );
}
