/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { FaUserEdit } from "react-icons/fa";

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
    identificacion: "V-",
    email: "",
  });

  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (cliente) setForm(cliente);
  }, [cliente]);

  const handleIdentificacionChange = (
    prefijo: "V-" | "J-" | "E-",
    valorSinPrefijo: string
  ) => {
    const tipoMap: Record<"V-" | "J-" | "E-", "NATURAL" | "EMPRESA"> = {
      "V-": "NATURAL",
      "J-": "EMPRESA",
      "E-": "NATURAL",
    };
    setForm((prev) => ({
      ...prev,
      tipo: tipoMap[prefijo],
      identificacion: prefijo + valorSinPrefijo,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  function validarFormularioLocal(data: ClienteData) {
    const errores: { [key: string]: string } = {};
    if (!data.nombre.trim()) errores.nombre = "Nombre obligatorio";
    if (!data.apellido.trim()) errores.apellido = "Apellido obligatorio";
    if (!data.telefono.trim()) errores.telefono = "Teléfono obligatorio";
    if (!data.direccion.trim()) errores.direccion = "Dirección obligatoria";
    if (!data.identificacion.trim())
      errores.identificacion = "Identificación obligatoria";
    return errores;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const erroresDetectados = validarFormularioLocal(form);
    setErrores(erroresDetectados);

    if (Object.keys(erroresDetectados).length > 0) {
      return;
    }

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
        identificacion: "V-",
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
      <div className="bg-white rounded-lg p-6 w-[480px] shadow-xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-700">
            <FaUserEdit />
            {cliente ? "Editar Cliente" : "Registrar Cliente"}
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 text-sm text-gray-700"
        >
          {/* Nombre y Apellido */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block">Nombre:</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:ring focus:ring-indigo-200"
              />
              {errores.nombre && (
                <p className="text-red-600 text-xs font-medium">
                  {errores.nombre}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block">Apellido:</label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:ring focus:ring-indigo-200"
              />
              {errores.apellido && (
                <p className="text-red-600 text-xs font-medium">
                  {errores.apellido}
                </p>
              )}
            </div>
          </div>

          {/* Teléfonos */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block">Teléfono principal:</label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:ring focus:ring-indigo-200"
              />
              {errores.telefono && (
                <p className="text-red-600 text-xs font-medium">
                  {errores.telefono}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block">Teléfono secundario:</label>
              <input
                type="tel"
                name="telefono_secundario"
                value={form.telefono_secundario}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:ring focus:ring-indigo-200"
              />
              {errores.telefono_secundario && (
                <p className="text-red-600 text-xs font-medium">
                  {errores.telefono_secundario}
                </p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block">Dirección:</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:ring focus:ring-indigo-200"
            />
            {errores.direccion && (
              <p className="text-red-600 text-xs font-medium">
                {errores.direccion}
              </p>
            )}
          </div>

          {/* Identificación */}
          <div>
            <label className="block">Identificación:</label>
            <div className="flex items-center gap-2">
              <select
                className="px-2 py-2 border rounded bg-gray-50 text-sm font-medium"
                value={form.identificacion.slice(0, 2)}
                onChange={(e) => {
                  const prefijo = e.target.value as "V-" | "J-" | "E-";
                  const sinPrefijo = form.identificacion.replace(
                    /^(V-|J-|E-)/,
                    ""
                  );
                  handleIdentificacionChange(prefijo, sinPrefijo);
                }}
              >
                <option value="V-">V</option>
                <option value="J-">J</option>
                <option value="E-">E</option>
              </select>
              <input
                name="identificacion"
                value={form.identificacion.replace(/^(V-|J-|E-)/, "")}
                onChange={(e) => {
                  const prefijo = form.identificacion.slice(0, 2) as
                    | "V-"
                    | "J-"
                    | "E-";
                  handleIdentificacionChange(prefijo, e.target.value);
                }}
                className="flex-1 border px-3 py-2 rounded focus:ring focus:ring-indigo-200"
                placeholder="Número sin prefijo"
              />
            </div>
            {errores.identificacion && (
              <p className="text-red-600 text-xs font-medium">
                {errores.identificacion}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block">Correo electrónico:</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:ring focus:ring-indigo-200"
              placeholder="Ej. cliente@email.com"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
            >
              {cliente ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
