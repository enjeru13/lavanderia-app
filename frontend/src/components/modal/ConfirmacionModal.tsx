import React from "react";

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
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center border border-gray-200 text-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{titulo}</h3>

        <p className="text-gray-700 mb-6">{mensaje}</p>

        <div className="flex justify-end gap-3 font-medium">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionModal;
