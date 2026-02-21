import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaTags, FaPlus, FaTimes, FaPen, FaTrashAlt } from "react-icons/fa";
import { categoriasService } from "../../services/categoriasService";
import { Categoria } from "@lavanderia/shared/types/types";
import { AxiosError } from "axios";
import Button from "../ui/Button"; // 1. Importamos el Button

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
  const [estaGuardando, setEstaGuardando] = useState(false);

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

    setEstaGuardando(true);
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
    } finally {
      setEstaGuardando(false);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 sm:p-6 transition-all">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100 border border-gray-200 dark:border-gray-800">

        {/* HEADER */}
        <div className="bg-linear-to-r from-purple-600 to-purple-800 dark:from-purple-800 dark:to-purple-950 text-white px-6 py-4 flex justify-between items-center shadow-md rounded-t-2xl transition-all">
          <h2 className="text-xl font-extrabold flex items-center gap-3">
            <FaTags className="text-2xl" />
            Gestionar Categorías
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-white hover:text-purple-200 dark:hover:text-purple-400 text-3xl font-bold transition-transform transform hover:rotate-90 cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-6 flex-1 flex flex-col space-y-5 text-base text-gray-800 dark:text-gray-200 transition-colors min-h-0">

          {/* FORMULARIO */}
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
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 shadow-sm"
            />

            {/* Botón Principal (Guardar/Añadir) */}
            <Button
              type="submit"
              variant="primary"
              leftIcon={modoEdicion ? <FaPen /> : <FaPlus />}
              isLoading={estaGuardando}
              disabled={estaGuardando}
            >
              {modoEdicion ? "Guardar" : "Añadir"}
            </Button>

            {/* Botón Cancelar Edición */}
            {modoEdicion && (
              <Button
                type="button"
                onClick={cancelarEdicion}
                variant="secondary"
              >
                Cancelar
              </Button>
            )}
          </form>

          {/* LISTA DE CATEGORÍAS */}
          {cargando ? (
            <p className="text-center text-purple-600 dark:text-purple-400 font-semibold py-8">
              Cargando categorías...
            </p>
          ) : errorCarga ? (
            <p className="text-center text-red-600 dark:text-red-400 font-semibold py-8">
              {errorCarga}
            </p>
          ) : categorias.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
              No hay categorías registradas.
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar transition-all">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-sm transition-colors"
                >
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    {categoria.nombre}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => iniciarEdicion(categoria)}
                      title="Editar categoría"
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm cursor-pointer"
                    >
                      <FaPen />
                    </button>
                    <button
                      onClick={() => confirmarEliminar(categoria.id)}
                      title="Eliminar categoría"
                      className="p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm cursor-pointer"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex justify-end shadow-inner rounded-b-2xl transition-all">
          <Button onClick={onClose} variant="secondary">
            Cerrar
          </Button>
        </div>
      </div>

      {/* CONFIRMACIÓN ELIMINAR (MODAL INTERNO) */}
      {mostrarConfirmacionEliminar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-700 dark:text-gray-400">
              ¿Estás segura de que deseas eliminar esta categoría? Si tiene
              servicios asociados, NO podrá eliminarse. Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end gap-3 transition-colors">
              <Button
                onClick={() => setMostrarConfirmacionEliminar(false)}
                variant="secondary"
              >
                Cancelar
              </Button>

              {/* Botón Eliminar Destructivo (Mantenemos nativo o usamos variante Danger si existe, aquí nativo por seguridad visual) */}
              <button
                onClick={ejecutarEliminar}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer active:scale-95 font-bold"
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