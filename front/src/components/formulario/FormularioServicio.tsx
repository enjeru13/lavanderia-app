/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
  const [precio, setPrecio] = useState(0);
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (servicio) {
      setNombre(servicio.nombreServicio || "");
      setPrecio(servicio.precioBase || 0);
      setDescripcion(servicio.descripcion || "");
    }
  }, [servicio]);

  const guardar = async () => {
    if (!nombre || precio <= 0) {
      toast.error("Nombre y precio son obligatorios");
      return;
    }

    const data = {
      id: servicio?.id,
      nombreServicio: nombre,
      precioBase: precio,
      descripcion,
    };

    try {
      await onSubmit(data);
      onClose();
      setNombre("");
      setPrecio(0);
      setDescripcion("");
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      toast.error("Ocurrió un error al guardar el servicio");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">
        {servicio ? "Editar Servicio" : "Registrar Nuevo Servicio"}
      </h2>

      <input
        type="text"
        placeholder="Nombre del servicio"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="mb-3 px-3 py-2 border rounded w-full"
      />

      <input
        type="number"
        placeholder="Precio base"
        value={precio}
        min={0}
        onChange={(e) => setPrecio(parseFloat(e.target.value))}
        className="mb-3 px-3 py-2 border rounded w-full"
      />

      <textarea
        placeholder="Descripción (opcional)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="mb-3 px-3 py-2 border rounded w-full"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
