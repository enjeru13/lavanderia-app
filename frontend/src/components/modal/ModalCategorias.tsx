import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaTags, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { categoriasService } from "../../services/categoriasService";
import { Categoria } from "@lavanderia/shared/types/types";
import { AxiosError } from "axios";

type Props = {
  onClose: () => void;
};

interface CategoriaFormState {
  id?: string;
  nombre: string;
}

export default function CategoriasModal({ onClose }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [formState, setFormState] = useState<CategoriaFormState>({
    nombre: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] =
    useState(false);
  const [categoriaAEliminarId, setCategoriaAEliminarId] = useState<
    string | undefined
  >();

  const cargarCategorias = async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const res = await categoriasService.getAll();
      setCategorias(Array.isArray(res) ? res : []);
    } catch (error: unknown) {
      console.error("Error al cargar categorías:", error);
      let errorMessage = "Ocurrió un error desconocido al cargar categorías.";
      if (error instanceof AxiosError) {
        errorMessage =
          error.response?.data?.message ||
          "No se pudieron cargar las categorías.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setErrorCarga(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nombre.trim()) {
      toast.error("El nombre de la categoría no puede estar vacío.");
      return;
    }

    try {
      if (modoEdicion && formState.id) {
        await categoriasService.update(formState.id, {
          nombre: formState.nombre,
        });
        toast.success("Categoría actualizada correctamente.");
      } else {
        await categoriasService.create({ nombre: formState.nombre });
        toast.success("Categoría creada correctamente.");
      }
      setFormState({ nombre: "" });
      setModoEdicion(false);
      cargarCategorias();
    } catch (error: unknown) {
      console.error("Error al guardar categoría:", error);
      let errorMessage = "Error al guardar categoría.";
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          errorMessage =
            error.response.data.message ||
            "Ya existe una categoría con ese nombre.";
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const iniciarEdicion = (categoria: Categoria) => {
    setFormState({ id: categoria.id, nombre: categoria.nombre });
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setFormState({ nombre: "" });
    setModoEdicion(false);
  };

  const confirmarEliminar = (id: string) => {
    setCategoriaAEliminarId(id);
    setMostrarConfirmacionEliminar(true);
  };

  const ejecutarEliminar = async () => {
    if (!categoriaAEliminarId) return;

    try {
      await categoriasService.remove(categoriaAEliminarId);
      toast.success("Categoría eliminada correctamente.");
      cargarCategorias();
    } catch (error: unknown) {
      console.error("Error al eliminar categoría:", error);
      let errorMessage = "Error al eliminar categoría.";
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 400) {
          errorMessage =
            error.response.data.message ||
            "No se pudo eliminar la categoría. Asegúrate de que no tenga servicios asociados.";
        } else if (error.response.status === 404) {
          errorMessage =
            error.response.data.message ||
            "Categoría no encontrada para eliminar.";
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setMostrarConfirmacionEliminar(false);
      setCategoriaAEliminarId(undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 flex justify-between items-center shadow-md rounded-t-2xl">
          <h2 className="text-xl font-extrabold flex items-center gap-3">
            <FaTags className="text-2xl" />
            Gestionar Categorías
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-white hover:text-purple-200 text-3xl font-bold transition-transform transform hover:rotate-90"
          >
            <FaTimes />
          </button>
        </div>

        <div className="px-6 py-6 flex-1 flex flex-col space-y-5 text-base text-gray-800 min-h-0">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <input
              type="text"
              placeholder={
                modoEdicion
                  ? "Editar nombre de categoría"
                  : "Nombre de nueva categoría"
              }
              value={formState.nombre}
              onChange={(e) =>
                setFormState({ ...formState, nombre: e.target.value })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            />
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg flex items-center gap-2 font-semibold text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out ${
                modoEdicion
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {modoEdicion ? (
                <>
                  <FaEdit /> Guardar
                </>
              ) : (
                <>
                  <FaPlus /> Añadir
                </>
              )}
            </button>
            {modoEdicion && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="px-5 py-2 rounded-lg flex items-center gap-2 font-semibold text-gray-800 bg-gray-200 hover:bg-gray-300 border border-gray-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
              >
                Cancelar
              </button>
            )}
          </form>

          {cargando ? (
            <p className="text-center text-purple-600 font-semibold py-8">
              Cargando categorías...
            </p>
          ) : errorCarga ? (
            <p className="text-center text-red-600 font-semibold py-8">
              {errorCarga}
            </p>
          ) : categorias.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">
              No hay categorías registradas.
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
                >
                  <p className="font-semibold text-gray-900 text-lg">
                    {categoria.nombre}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => iniciarEdicion(categoria)}
                      title="Editar categoría"
                      className="p-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => confirmarEliminar(categoria.id)}
                      title="Eliminar categoría"
                      className="p-2 bg-red-100 border border-red-300 text-red-700 rounded-md hover:bg-red-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end shadow-inner rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 ease-in-out font-semibold shadow-sm hover:shadow-md"
          >
            Cerrar
          </button>
        </div>
      </div>

      {mostrarConfirmacionEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-700">
              ¿Estás segura de que deseas eliminar esta categoría? Si tiene
              servicios asociados, NO podrá eliminarse. Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarConfirmacionEliminar(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminar}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
