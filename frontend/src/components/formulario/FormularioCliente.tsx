import { useState, useEffect } from "react";
import { FaUserEdit } from "react-icons/fa";
import type {
  Cliente,
  ClienteCreate,
  ClienteUpdatePayload,
  TipoCliente,
} from "../../types/types";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";

type ClienteFormState = ClienteCreate & { id?: number };

type Props = {
  cliente?: Cliente;
  onClose: () => void;
  onSubmit: (
    data: ClienteCreate | (ClienteUpdatePayload & { id: number })
  ) => Promise<void>;
};

export default function FormularioCliente({
  cliente,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<ClienteFormState>({
    nombre: "",
    apellido: "",
    tipo: "NATURAL",
    telefono: "",
    telefono_secundario: null,
    direccion: "",
    identificacion: "V-",
    email: null,
  });

  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cliente) {
      setForm({
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        tipo: cliente.tipo,
        telefono: cliente.telefono,
        telefono_secundario:
          cliente.telefono_secundario === ""
            ? null
            : cliente.telefono_secundario,
        direccion: cliente.direccion,
        identificacion: cliente.identificacion,
        email: cliente.email === "" ? null : cliente.email,
      });
    } else {
      setForm({
        nombre: "",
        apellido: "",
        tipo: "NATURAL",
        telefono: "",
        telefono_secundario: null,
        direccion: "",
        identificacion: "V-",
        email: null,
      });
    }
  }, [cliente]);

  const handleIdentificacionChange = (
    prefijo: "V-" | "J-" | "E-",
    valorSinPrefijo: string
  ) => {
    const tipoMap: Record<"V-" | "J-" | "E-", TipoCliente> = {
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const newValue =
      (name === "telefono_secundario" || name === "email") && value === ""
        ? null
        : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  function validarFormularioLocal(
    data: ClienteFormState
  ): Record<string, string> {
    const errores: Record<string, string> = {};
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const regexTelefono = /^[0-9()+\-.\s]{6,20}$/;
    const regexIdentificacion = /^(V|J|E)-\d{6,10}$/;

    if (!data.nombre.trim()) {
      errores.nombre = "Nombre obligatorio";
    } else if (!soloLetras.test(data.nombre)) {
      errores.nombre = "Solo letras permitidas";
    } else if (data.nombre.trim().length < 2) {
      errores.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!data.apellido.trim()) {
      errores.apellido = "Apellido obligatorio";
    } else if (!soloLetras.test(data.apellido)) {
      errores.apellido = "Solo letras permitidas";
    } else if (data.apellido.trim().length < 2) {
      errores.apellido = "El apellido debe tener al menos 2 caracteres";
    }

    if (!data.telefono.trim()) {
      errores.telefono = "Teléfono obligatorio";
    } else if (!regexTelefono.test(data.telefono)) {
      errores.telefono =
        "Formato de teléfono inválido (solo números y símbolos)";
    }

    if (
      data.telefono_secundario &&
      data.telefono_secundario.trim() !== "" &&
      !regexTelefono.test(data.telefono_secundario)
    ) {
      errores.telefono_secundario = "Formato de teléfono secundario inválido";
    }

    if (!data.direccion.trim()) {
      errores.direccion = "Dirección obligatoria";
    } else if (data.direccion.trim().length < 4) {
      errores.direccion = "La dirección debe tener al menos 4 caracteres";
    }

    if (!data.identificacion.trim()) {
      errores.identificacion = "Identificación obligatoria";
    } else if (!regexIdentificacion.test(data.identificacion)) {
      errores.identificacion =
        "Formato de identificación inválido (Ej: V-12345678)";
    }

    if (
      data.email &&
      data.email.trim() !== "" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    ) {
      errores.email = "Formato de correo inválido";
    }

    return errores;
  }

  const resetForm = () => {
    setForm({
      nombre: "",
      apellido: "",
      tipo: "NATURAL",
      telefono: "",
      telefono_secundario: null,
      direccion: "",
      identificacion: "V-",
      email: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const erroresDetectados = validarFormularioLocal(form);
    setErrores(erroresDetectados);

    if (Object.keys(erroresDetectados).length > 0) return;

    const datosParaBackend = {
      ...form,
      telefono_secundario:
        form.telefono_secundario === "" ? null : form.telefono_secundario,
      email: form.email === "" ? null : form.email,
    };

    try {
      if (cliente && cliente.id) {
        const updateData: ClienteUpdatePayload & { id: number } = {
          id: cliente.id,
          nombre: datosParaBackend.nombre,
          apellido: datosParaBackend.apellido,
          tipo: datosParaBackend.tipo,
          telefono: datosParaBackend.telefono,
          telefono_secundario: datosParaBackend.telefono_secundario,
          direccion: datosParaBackend.direccion,
          identificacion: datosParaBackend.identificacion,
          email: datosParaBackend.email,
        };
        await onSubmit(updateData);
      } else {
        const createData: ClienteCreate = {
          nombre: datosParaBackend.nombre,
          apellido: datosParaBackend.apellido,
          tipo: datosParaBackend.tipo,
          telefono: datosParaBackend.telefono,
          telefono_secundario: datosParaBackend.telefono_secundario,
          direccion: datosParaBackend.direccion,
          identificacion: datosParaBackend.identificacion,
          email: datosParaBackend.email,
        };
        await onSubmit(createData);
      }
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
        toast.error("Error inesperado al guardar el cliente.");
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
                required
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
                required
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
                required
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
                value={form.telefono_secundario || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              {errores.telefono_secundario && (
                <p className="text-red-600 text-xs mt-1">
                  {errores.telefono_secundario}
                </p>
              )}
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
              required
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
                required
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
              value={form.email || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Ej. cliente@email.com"
            />
            {errores.email && (
              <p className="text-red-600 text-xs mt-1">{errores.email}</p>
            )}
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
