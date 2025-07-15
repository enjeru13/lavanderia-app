/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import TablaServicios from "../components/tabla/TablaServicios";
import FormularioServicio from "../components/formulario/FormularioServicio";

export default function PantallaServicios() {
  const [servicios, setServicios] = useState<any[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] =
    useState<any>(undefined);

  const cargarServicios = async () => {
    try {
      const res = await axios.get("/api/servicios");
      setServicios(res.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      toast.error("No se pudieron cargar los servicios");
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const abrirNuevoServicio = () => {
    setServicioSeleccionado(undefined);
    setMostrarFormulario(true);
  };

  const editarServicio = (servicio: any) => {
    setServicioSeleccionado(servicio);
    setMostrarFormulario(true);
  };

  const guardarServicio = async (data: any) => {
    try {
      if (data.id) {
        await axios.put(`/api/servicios/${data.id}`, data);
        toast.success("Servicio actualizado correctamente");
      } else {
        await axios.post("/api/servicios", data);
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

  const eliminarServicio = async (id: number) => {
    if (!window.confirm("¿Estás segura de que deseas eliminar este servicio?"))
      return;
    try {
      await axios.delete(`/api/servicios/${id}`);
      toast.success("Servicio eliminado correctamente");
      cargarServicios();
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      toast.error("Error al eliminar servicio");
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
        onEliminar={eliminarServicio}
      />

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <FormularioServicio
              servicio={servicioSeleccionado}
              onClose={() => setMostrarFormulario(false)}
              onSubmit={guardarServicio}
            />
            <div className="text-right mt-4">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
