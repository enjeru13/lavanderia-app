/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import FormularioServicio from "../components/FormularioServicio";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";

export default function PantallaServicios() {
  const [servicios, setServicios] = useState<any[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
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
    setMostrarModal(true);
  };

  const editarServicio = (servicio: any) => {
    setServicioSeleccionado(servicio);
    setMostrarModal(true);
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
      setMostrarModal(false);
      setServicioSeleccionado(undefined);
      cargarServicios();
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      toast.error("Error al guardar servicio");
    }
  };

  const eliminarServicio = async (id: number) => {
    const confirmado = window.confirm(
      "¿Estás seguro de que deseas eliminar este servicio?"
    );
    if (!confirmado) return;

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
        <button
          onClick={abrirNuevoServicio}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </div>

      <table className="w-full bg-white shadow rounded table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Precio</th>
            <th className="px-4 py-2 text-left">Descripción</th>
            <th className="px-4 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((s: any) => (
            <tr key={s.id} className="border-t">
              <td className="px-4 py-2">{s.nombreServicio}</td>
              <td className="px-4 py-2">${s.precioBase.toFixed(2)}</td>
              <td className="px-4 py-2">{s.descripcion || "—"}</td>
              <td className="px-4 py-2 text-right">
                <div className="inline-flex gap-2">
                  <button
                    onClick={() => editarServicio(s)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarServicio(s.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <FormularioServicio
              servicio={servicioSeleccionado}
              onClose={() => setMostrarModal(false)}
              onSubmit={guardarServicio}
            />
            <div className="text-right mt-4">
              <button
                onClick={() => setMostrarModal(false)}
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
