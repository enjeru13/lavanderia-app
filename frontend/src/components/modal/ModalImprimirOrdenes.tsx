import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { createPortal } from "react-dom";
import { FaPrint } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { OrdenesPrintable } from "../OrdenesPrintable";
import type {
  Moneda,
  Orden,
  Configuracion,
  EstadoOrden,
  EstadoPagoRaw,
} from "@lavanderia/shared/types/types";

interface Props {
  visible: boolean;
  onClose: () => void;
  ordenes: Orden[];
  monedaPrincipal: Moneda;
  configuracion: Configuracion | null;
  filtros: {
    estado: EstadoOrden | "TODOS" | "";
    pago: EstadoPagoRaw | "TODOS" | "";
  };
}

export default function ModalImprimirOrdenes({
  visible,
  onClose,
  ordenes,
  monedaPrincipal,
  configuracion,
  filtros,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const imprimir = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Reporte_Ordenes_${new Date().toISOString().split("T")[0]}`,
    pageStyle: `
      @page { size: auto; margin: 15mm; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    `,
  });

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-999 p-4 print:hidden transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full flex flex-col h-[90vh] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FaPrint className="text-blue-600 dark:text-blue-400" /> Vista Previa de Reporte
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800 p-6 transition-colors">
          <div className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-8 print:shadow-none print:m-0 print:p-0 print:max-w-none print:min-h-0">
            <OrdenesPrintable
              ref={printRef}
              ordenes={ordenes}
              monedaPrincipal={monedaPrincipal}
              configuracion={configuracion}
              filtros={filtros}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3 transition-colors">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => imprimir()}
            className="px-6 py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <FaPrint /> Imprimir
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
