import { useEffect, useState } from "react";
import { MdOutlineLocalLaundryService } from "react-icons/md";
import { toast } from "react-toastify";
import type {
  Servicio,
  ServicioCreate,
  ServicioUpdatePayload,
} from "../../../../shared/types/types";

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
    if (!nombre.trim()) nuevosErrores.nombre = "Nombre obligatorio";
    if (precio === null || isNaN(precio) || precio < 0)
      nuevosErrores.precio = "Precio inválido";

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
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      {" "}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
            <MdOutlineLocalLaundryService />{" "}
            {servicio ? "Editar Servicio" : "Registrar Servicio"}
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <label className="block pb-1">Nombre del servicio:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:ring focus:ring-blue-200"
              disabled={cargando}
            />
            {errores.nombre && (
              <p className="text-red-600 text-xs font-medium mt-1">
                {errores.nombre}
              </p>
            )}
          </div>

          <div>
            <label className="block pb-1">Precio base:</label>
            <input
              type="number"
              step="any"
              value={precio ?? ""}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                setPrecio(isNaN(parsed) ? null : parsed);
              }}
              className="w-full border border-gray-300 p-3 rounded focus:ring focus:ring-blue-200"
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
            <label className="block pb-1">Descripción (opcional):</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring focus:ring-blue-200 resize-none"
              rows={3}
              disabled={cargando}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={permiteDecimales}
                onChange={(e) => setPermiteDecimales(e.target.checked)}
                className="accent-blue-600 w-4 h-4"
                disabled={cargando}
              />
              <span>¿Permite decimales en cantidad?</span>
            </label>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end font-bold gap-2 mt-6">
          <button
            onClick={onClose}
            className="p-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            className={`px-3 py-2 rounded text-sm font-medium ${
              cargando
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={cargando}
          >
            {cargando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
