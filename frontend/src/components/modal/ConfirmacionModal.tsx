import React from "react";
import {
  FaExclamationTriangle,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";

interface ConfirmacionModalProps {
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
  titulo?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}

const ConfirmacionModal: React.FC<ConfirmacionModalProps> = ({
  mensaje,
  onConfirm,
  onCancel,
  titulo = "Confirmar acción",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4 sm:p-6 transition-all">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-200 dark:border-gray-800 text-base transform transition-all duration-300 scale-100 opacity-100">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-center gap-3 transition-colors">
          <FaExclamationTriangle size={28} className="text-yellow-500 dark:text-yellow-400" />
          {titulo}
        </h3>

        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 transition-colors">
          {mensaje}
        </p>
        <div className="flex justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-800 mt-6 transition-colors">
          <button
            onClick={onCancel}
            className="px-6 py-3.5 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            <FaTimesCircle size={18} /> {textoCancelar}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3.5 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 ease-in-out flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            <FaCheckCircle size={18} /> {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionModal;
