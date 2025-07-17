/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { MdOutlineLocalLaundryService } from "react-icons/md";

export default function FormularioServicio({
  servicio,
  onClose,
  onSubmit,
}: {
  servicio?: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [errores, setErrores] = useState<{ nombre?: string; precio?: string }>(
    {}
  );

  useEffect(() => {
    if (servicio) {
      setNombre(servicio.nombreServicio || "");
      setPrecio(servicio.precioBase || null);
      setDescripcion(servicio.descripcion || "");
    }
  }, [servicio]);

  const guardar = async () => {
    const nuevosErrores: typeof errores = {};
    if (!nombre.trim()) nuevosErrores.nombre = "Nombre obligatorio";
    if (precio === null || precio <= 0)
      nuevosErrores.precio = "Precio inválido";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const data = {
      id: servicio?.id,
      nombreServicio: nombre.trim(),
      precioBase: precio,
      descripcion: descripcion.trim() || undefined,
    };

    try {
      await onSubmit(data);
      onClose();
      setNombre("");
      setPrecio(null);
      setDescripcion("");
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      alert("Ocurrió un error al guardar el servicio");
    }
  };

  return (
    <div className="fixed inset-0 bg-black font-semibold flex items-center justify-center z-50">
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
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end font-bold gap-2 mt-6">
          <button
            onClick={onClose}
            className="p-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            className="px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
