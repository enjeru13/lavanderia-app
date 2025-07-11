/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

type ClienteData = {
  id?: number;
  nombre: string;
  apellido: string;
  tipo: "NATURAL" | "EMPRESA";
  telefono: string;
  telefono_secundario?: string;
  direccion: string;
  identificacion: string;
  email: string;
};

type Props = {
  cliente?: ClienteData;
  onClose: () => void;
  onSubmit: (data: ClienteData) => Promise<void>;
};

export default function FormularioCliente({
  cliente,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<ClienteData>({
    nombre: "",
    apellido: "",
    tipo: "NATURAL",
    telefono: "",
    telefono_secundario: "",
    direccion: "",
    identificacion: "",
    email: "",
  });

  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (cliente) {
      console.log("🧾 Cliente recibido en formulario:", cliente);
      setForm(cliente);
    }
  }, [cliente]);

  const getPrefijo = () => (form.tipo === "NATURAL" ? "V-" : "J-");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tipo") {
      const nuevoPrefijo = value === "NATURAL" ? "V-" : "J-";
      setForm((prev) => ({
        ...prev,
        tipo: value as "NATURAL" | "EMPRESA",
        identificacion: prev.identificacion.replace(/^(V-|J-)?/, nuevoPrefijo),
      }));
    } else if (name === "identificacion") {
      const sinPrefijo = value.replace(/^(V-|J-)?/, "");
      setForm((prev) => ({
        ...prev,
        identificacion: getPrefijo() + sinPrefijo,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});

    const datosFinales = {
      ...form,
      telefono_secundario: form.telefono_secundario?.trim() || undefined,
    };

    try {
      await onSubmit(datosFinales);
      setForm({
        nombre: "",
        apellido: "",
        tipo: "NATURAL",
        telefono: "",
        telefono_secundario: "",
        direccion: "",
        identificacion: "",
        email: "",
      });
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data?.detalles) {
        const detalles = error.response.data.detalles;
        const erroresFormateados: { [key: string]: string } = {};
        for (const campo in detalles) {
          erroresFormateados[campo] =
            detalles[campo]?._errors?.[0] || "Campo inválido";
        }
        setErrores(erroresFormateados);
      } else {
        alert("Error inesperado al guardar el cliente.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[470px] shadow-lg">
        <h2 className="text-xl font-bold text-blue-700 mb-4">
          {cliente ? "Editar Cliente" : "Registrar Cliente"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nombre y Apellido */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full px-3 py-2 border rounded"
              />
              {errores.nombre && (
                <p className="text-red-600 py-2 text-sm font-bold">{errores.nombre}</p>
              )}
            </div>
            <div className="w-1/2">
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Apellido"
                className="w-full px-3 py-2 border rounded"
              />
              {errores.apellido && (
                <p className="text-red-600 py-2 text-sm font-bold">{errores.apellido}</p>
              )}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="NATURAL">Natural</option>
              <option value="EMPRESA">Empresa</option>
            </select>
            {errores.tipo && (
              <p className="text-red-600 py-2 text-sm font-bold">{errores.tipo}</p>
            )}
          </div>

          {/* Teléfonos */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Teléfono Principal"
                className="w-full px-3 py-2 border rounded"
              />
              {errores.telefono && (
                <p className="text-red-600 py-2 text-sm font-bold">{errores.telefono}</p>
              )}
            </div>
            <div className="w-1/2">
              <input
                type="tel"
                name="telefono_secundario"
                value={form.telefono_secundario}
                onChange={handleChange}
                placeholder="Teléfono Secundario (opcional)"
                className="w-full px-3 py-2 border rounded"
              />
              {errores.telefono_secundario && (
                <p className="text-red-600 py-2 text-sm font-bold">
                  {errores.telefono_secundario}
                </p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Dirección"
              className="w-full px-3 py-2 border rounded"
            />
            {errores.direccion && (
              <p className="text-red-600 py-2 text-sm font-bold">{errores.direccion}</p>
            )}
          </div>

          {/* Identificación dividida */}
          <div>
            <label className="flex items-center gap-2">
              <span className="px-2 py-2 bg-gray-100 border rounded text-sm font-medium">
                {getPrefijo()}
              </span>
              <input
                name="identificacion"
                value={form.identificacion.replace(/^(V-|J-)/, "")}
                onChange={(e) =>
                  handleChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: "identificacion",
                      value: getPrefijo() + e.target.value,
                    },
                  })
                }
                placeholder="Número de identificación"
                className="flex-1 px-3 py-2 border rounded"
              />
            </label>
            {errores.identificacion && (
              <p className="text-red-600 py-2 text-sm font-bold">
                {errores.identificacion}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="w-full px-3 py-2 border rounded"
            />
            {errores.email && (
              <p className="text-red-600 py-2 text-sm font-bold">{errores.email}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {cliente ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
