import { useState } from "react";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";

interface ModalContraseñaProps {
  onConfirmado: () => void;
  onCancelar: () => void;
  visible: boolean;
  titulo?: string;
}

export default function ModalContraseña({
  onConfirmado,
  onCancelar,
  visible,
  titulo = "Acción protegida",
}: ModalContraseñaProps) {
  const [claveIngresada, setClaveIngresada] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const validarClave = async () => {
    setError("");
    if (!claveIngresada.trim()) {
      setError("Por favor, ingresa la contraseña.");
      return;
    }

    setCargando(true);
    try {
      const esValida = await authService.validarAdminPassword(claveIngresada);

      if (esValida) {
        onConfirmado();
        setClaveIngresada("");
        setError("");
      } else {
        setError("La contraseña ingresada no es válida.");
        toast.error("Contraseña incorrecta.");
      }
    } catch (err) {
      console.error("Error en la validación de contraseña:", err);
      setError("Ocurrió un error al validar la contraseña.");
      toast.error("Error de conexión o del servidor.");
    } finally {
      setCargando(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-sm text-sm space-y-5">
        <h3 className="text-lg font-semibold text-center text-gray-800">
          {titulo}
        </h3>

        <p className="text-xs text-gray-500 text-center"></p>

        <input
          type="password"
          placeholder="Contraseña"
          value={claveIngresada}
          onChange={(e) => setClaveIngresada(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              validarClave();
            }
          }}
          className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring ${
            error
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-indigo-300"
          }`}
          disabled={cargando}
        />

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancelar}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-xs"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            onClick={validarClave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-md"
            disabled={cargando}
          >
            {cargando ? "Validando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
