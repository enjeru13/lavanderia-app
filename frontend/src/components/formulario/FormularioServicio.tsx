import { useEffect, useState } from "react";
import { MdOutlineLocalLaundryService } from "react-icons/md";
import { toast } from "react-toastify";
import type {
  Servicio,
  ServicioCreate,
  ServicioUpdatePayload,
} from "@lavanderia/shared/types/types";

type FormularioServicioProps = {
  servicio?: Servicio;
  onClose: () => void;
  onSubmit: (
    data: ServicioCreate | (ServicioUpdatePayload & { id: number })
  ) => Promise<void>;
};

export default function FormularioServicio({
  servicio,
  onClose,
  onSubmit,
}: FormularioServicioProps) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [errores, setErrores] = useState<{ nombre?: string; precio?: string }>(
    {}
  );
  const [permiteDecimales, setPermiteDecimales] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (servicio) {
      setNombre(servicio.nombreServicio || "");
      setPrecio(servicio.precioBase || null);
      setDescripcion(servicio.descripcion || "");
      setPermiteDecimales(servicio.permiteDecimales ?? false);
    } else {
      setNombre("");
      setPrecio(null);
      setDescripcion("");
      setPermiteDecimales(false);
    }
    setErrores({});
  }, [servicio]);

  const guardar = async () => {
    const nuevosErrores: typeof errores = {};
    if (!nombre.trim())
      nuevosErrores.nombre = "El nombre del servicio es obligatorio.";
    if (precio === null || isNaN(precio) || precio < 0)
      nuevosErrores.precio = "El precio base debe ser un número positivo.";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    let data: ServicioCreate | (ServicioUpdatePayload & { id: number });

    const descripcionFinal = descripcion.trim() || null;

    if (servicio?.id) {
      data = {
        id: servicio.id,
        nombreServicio: nombre.trim(),
        precioBase: precio as number,
        descripcion: descripcionFinal,
        permiteDecimales,
      };
    } else {
      data = {
        nombreServicio: nombre.trim(),
        precioBase: precio as number,
        descripcion: descripcionFinal,
        permiteDecimales,
      };
    }

    setCargando(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      toast.error("Ocurrió un error al guardar el servicio");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
          <h2 className="text-xl font-extrabold flex items-center gap-3">
            <MdOutlineLocalLaundryService className="text-2xl" />
            {servicio ? "Editar Servicio" : "Registrar Servicio"}
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-white hover:text-blue-200 text-3xl font-bold transition-transform transform hover:rotate-90"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 text-base text-gray-800">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del servicio:
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Ej. Lavado y Secado por Kg"
              disabled={cargando}
            />
            {errores.nombre && (
              <p className="text-red-600 text-xs font-medium mt-1">
                {errores.nombre}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Precio base:
            </label>
            <input
              type="number"
              step="any"
              value={precio ?? ""}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                setPrecio(isNaN(parsed) ? null : parsed);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Ej. 12.50"
              disabled={cargando}
            />
            {errores.precio && (
              <p className="text-red-600 text-xs font-medium mt-1">
                {errores.precio}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción (opcional):
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-y min-h-[80px]"
              rows={3}
              placeholder="Ej. Incluye lavado, secado y doblado de ropa."
              disabled={cargando}
            />
          </div>

          <div>
            <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={permiteDecimales}
                onChange={(e) => setPermiteDecimales(e.target.checked)}
                className="accent-blue-600 w-5 h-5"
                disabled={cargando}
              />
              <span>¿Permite cantidades decimales?</span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 text-sm font-medium shadow-inner">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 ease-in-out font-semibold shadow-sm hover:shadow-md"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            className={`px-6 py-2 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out ${
              cargando
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={cargando}
          >
            {cargando ? "Guardando..." : "Guardar Servicio"}
          </button>
        </div>
      </div>
    </div>
  );
}
