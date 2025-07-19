import { useState, useEffect } from "react";
import { FaUserEdit } from "react-icons/fa";
import { type ClienteData } from "../../types/types";
import { isAxiosError } from "axios";

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

  const [errores, setErrores] = useState<Record<string, string>>({});

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

  function validarFormularioLocal(data: ClienteData): Record<string, string> {
    const errores: Record<string, string> = {};
    const soloLetras = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
    const soloNumeros = /^[0-9\s+()-]+$/;

    if (!data.nombre.trim()) {
      errores.nombre = "Nombre obligatorio";
    } else if (!soloLetras.test(data.nombre)) {
      errores.nombre = "Solo letras permitidas";
    }

    if (!data.apellido.trim()) {
      errores.apellido = "Apellido obligatorio";
    } else if (!soloLetras.test(data.apellido)) {
      errores.apellido = "Solo letras permitidas";
    }

    if (!data.telefono.trim()) {
      errores.telefono = "Teléfono obligatorio";
    } else if (!soloNumeros.test(data.telefono)) {
      errores.telefono = "Formato inválido";
    }

    if (!data.direccion.trim()) {
      errores.direccion = "Dirección obligatoria";
    }

    if (!data.identificacion.trim()) {
      errores.identificacion = "Identificación obligatoria";
    }

    return errores;
  }

  const resetForm = () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const erroresDetectados = validarFormularioLocal(form);
    setErrores(erroresDetectados);

    if (Object.keys(erroresDetectados).length > 0) return;

    const datosFinales: ClienteData = {
      ...form,
      telefono_secundario: form.telefono_secundario?.trim() || undefined,
      email: form.email?.trim() ? form.email.trim() : undefined,
    };

    try {
      await onSubmit(datosFinales);
      resetForm();
    } catch (error: unknown) {
      if (
        isAxiosError(error) &&
        error.response?.status === 400 &&
        error.response.data?.detalles
      ) {
        const detalles = error.response.data.detalles;
        const erroresFormateados: Record<string, string> = {};
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
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg h-[90vh] rounded-xl shadow-lg overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
            <FaUserEdit />
            {cliente ? "Editar cliente" : "Registrar cliente"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            title="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Formulario scrollable */}
        <form
          id="cliente-form"
          onSubmit={handleSubmit}
          className="px-6 py-4 flex-1 overflow-y-auto space-y-5 text-sm text-gray-700"
        >
          {/* Nombre y apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              {errores.nombre && (
                <p className="text-red-600 text-xs mt-1">{errores.nombre}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Apellido
              </label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              {errores.apellido && (
                <p className="text-red-600 text-xs mt-1">{errores.apellido}</p>
              )}
            </div>
          </div>

          {/* Teléfonos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Teléfono principal
              </label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              {errores.telefono && (
                <p className="text-red-600 text-xs mt-1">{errores.telefono}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Teléfono secundario
              </label>
              <input
                name="telefono_secundario"
                value={form.telefono_secundario}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Dirección
            </label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {errores.direccion && (
              <p className="text-red-600 text-xs mt-1">{errores.direccion}</p>
            )}
          </div>

          {/* Identificación */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Identificación
            </label>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Número sin prefijo"
              />
            </div>
            {errores.identificacion && (
              <p className="text-red-600 text-xs mt-1">
                {errores.identificacion}
              </p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Correo electrónico
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Ej. cliente@email.com"
            />
          </div>
        </form>

        {/* Botones */}
        <div className="px-6 py-4 flex justify-end gap-3 text-sm font-medium">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="cliente-form"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            {cliente ? "Actualizar" : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
