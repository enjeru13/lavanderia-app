import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import TablaServicios from "../components/tabla/TablaServicios";
import FormularioServicio from "../components/formulario/FormularioServicio";
import ConfirmacionModal from "../components/modal/ConfirmacionModal";
import { servicioService } from "../services/serviciosService";
import { configuracionService } from "../services/configuracionService";
import type {
  Servicio,
  ServicioCreate,
  ServicioUpdatePayload,
  Moneda,
} from "../../../shared/types/types";

export default function PantallaServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
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

  const abrirNuevoServicio = () => {
    setServicioSeleccionado(undefined);
    setMostrarFormulario(true);
  };

  const editarServicio = (servicio: Servicio) => {
    setServicioSeleccionado(servicio);
    setMostrarFormulario(true);
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

  const confirmarEliminarServicio = (id: number) => {
    setServicioAEliminarId(id);
    setMostrarConfirmacionEliminar(true);
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

      <TablaServicios
        servicios={servicios}
        onEditar={editarServicio}
        onEliminar={confirmarEliminarServicio}
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
