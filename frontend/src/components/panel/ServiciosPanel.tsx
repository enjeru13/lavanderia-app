import { formatearMoneda, type Moneda } from "../../utils/monedaHelpers";
import type {
  Servicio,
  ServicioSeleccionado,
  Categoria,
} from "@lavanderia/shared/types/types";
import React, { useState, useEffect, useMemo } from "react";
import { MdOutlineLocalLaundryService } from "react-icons/md";
import { categoriasService } from "../../services/categoriasService";
import { toast } from "react-toastify";

type Props = {
  serviciosCatalogo: Servicio[];
  serviciosSeleccionados: ServicioSeleccionado[];
  setServiciosSeleccionados: React.Dispatch<
    React.SetStateAction<ServicioSeleccionado[]>
  >;
  monedaPrincipal: Moneda;
};

export default function ServiciosPanel({
  serviciosCatalogo,
  serviciosSeleccionados,
  setServiciosSeleccionados,
  monedaPrincipal,
}: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaFiltroId, setCategoriaFiltroId] = useState<string | "">("");
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCargaCategorias, setErrorCargaCategorias] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setCargandoCategorias(true);
        const res = await categoriasService.getAll();
        setCategorias(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error(
          "Error al cargar categorías en el panel de servicios:",
          error
        );
        setErrorCargaCategorias("No se pudieron cargar las categorías.");
        toast.error("Error al cargar categorías para filtrar.");
      } finally {
        setCargandoCategorias(false);
      }
    };
    fetchCategorias();
  }, []);

  const actualizarCantidad = (servicioId: number, cantidad: number) => {
    setServiciosSeleccionados((prev) => {
      const otros = prev.filter((s) => s.servicioId !== servicioId);
      const cantidadFinal = Math.max(0, cantidad);
      return cantidadFinal > 0
        ? [...otros, { servicioId, cantidad: cantidadFinal }]
        : [...otros];
    });
  };

  const serviciosFiltrados = useMemo(() => {
    const safeServiciosCatalogo = Array.isArray(serviciosCatalogo)
      ? serviciosCatalogo
      : [];

    if (!categoriaFiltroId) {
      return safeServiciosCatalogo;
    }
    return safeServiciosCatalogo.filter(
      (servicio) => servicio.categoriaId === categoriaFiltroId
    );
  }, [serviciosCatalogo, categoriaFiltroId]);

  return (
    <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
      <header className="pb-4 border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <MdOutlineLocalLaundryService size={28} className="text-blue-500" />
          Servicios disponibles
        </h2>
      </header>

      <div className="mb-6">
        <label
          htmlFor="categoriaFiltro"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Filtrar por Categoría:
        </label>
        {cargandoCategorias ? (
          <p className="text-gray-500 italic">Cargando categorías...</p>
        ) : errorCargaCategorias ? (
          <p className="text-red-600 text-sm font-medium">
            {errorCargaCategorias}
          </p>
        ) : categorias.length === 0 ? (
          <p className="text-gray-500 italic text-sm">
            No hay categorías para filtrar.
          </p>
        ) : (
          <select
            id="categoriaFiltro"
            value={categoriaFiltroId}
            onChange={(e) => setCategoriaFiltroId(e.target.value)}
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviciosFiltrados && serviciosFiltrados.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 italic py-8">
            No hay servicios disponibles para la categoría seleccionada.
          </p>
        ) : (
          serviciosFiltrados.map((servicio) => {
            const actual = serviciosSeleccionados.find(
              (s) => s.servicioId === servicio.id
            );
            const cantidad = actual?.cantidad ?? 0;
            const subtotal = cantidad * servicio.precioBase;
            const stepValue = servicio.permiteDecimales ? 0.1 : 1;

            return (
              <div
                key={servicio.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 space-y-4"
              >
                <div className="text-xl font-bold text-gray-900">
                  {servicio.nombreServicio}
                </div>

                <p className="text-xs font-semibold text-blue-600">
                  {servicio.categoria?.nombre || "Sin Categoría"}
                </p>

                {servicio.descripcion && (
                  <p className="text-sm text-gray-600 italic font-semibold">
                    {servicio.descripcion}
                  </p>
                )}

                <div className="text-lg text-indigo-700 font-extrabold">
                  {formatearMoneda(servicio.precioBase, monedaPrincipal)}
                </div>

                <input
                  type="number"
                  min={0}
                  step={stepValue}
                  value={cantidad === 0 ? "" : String(cantidad)}
                  onChange={(e) =>
                    actualizarCantidad(servicio.id, parseFloat(e.target.value))
                  }
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base shadow-sm transition duration-200"
                  placeholder="Ingresa la cantidad"
                />

                {cantidad > 0 && (
                  <div className="text-lg text-green-700 font-bold pt-2">
                    Subtotal: {formatearMoneda(subtotal, monedaPrincipal)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
