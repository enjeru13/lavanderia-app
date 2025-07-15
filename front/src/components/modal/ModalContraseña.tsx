import { useState } from "react";
import { FiLock } from "react-icons/fi";

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
  titulo = "Confirmar acción protegida",
}: ModalContraseñaProps) {
  const [claveIngresada, setClaveIngresada] = useState("");
  const [error, setError] = useState("");

  const claveCorrecta = import.meta.env.VITE_CLAVE_ADMIN;
  console.log("Clave del .env cargada:", claveCorrecta);

  const validarClave = () => {
    if (claveIngresada.trim() === claveCorrecta) {
      onConfirmado();
      setClaveIngresada("");
      setError("");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-xl w-full max-w-sm text-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FiLock />
          {titulo}
        </h3>

        <input
          type="password"
          placeholder="Ingresa la contraseña"
          value={claveIngresada}
          onChange={(e) => setClaveIngresada(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-indigo-300"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancelar}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={validarClave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
