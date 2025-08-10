import { FaPrint } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { createPortal } from "react-dom";
import { PagosPrintable } from "../PagosPrintable";
import type { Moneda, Pago, Orden } from "../../../../shared/types/types";

interface PagoConOrden extends Pago {
  orden?: Orden & { cliente?: { nombre: string; apellido: string } };
}

interface Props {
  visible: boolean;
  onClose: () => void;
  pagos: PagoConOrden[];
  monedaPrincipal: Moneda;
  totalIngresos: number;
}

export default function ModalImprimirPagos({
  visible,
  onClose,
  pagos,
  monedaPrincipal,
  totalIngresos,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const imprimir = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @media print {
        body {
          margin: 0;
          padding: 0;
          font-size: 12px;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
    documentTitle: "Historial_Pagos",
    onAfterPrint: () => console.log("Historial de pagos impreso"),
  });

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[999] p-4 print:hidden">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-4xl w-full relative text-base transform transition-all duration-300 scale-100 opacity-100 ring-1 ring-gray-200 flex flex-col h-[90vh]">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaPrint size={28} className="text-blue-600" /> Vista previa de
            impresión
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-transform transform hover:rotate-90"
            title="Cerrar"
          >
            <FiX />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow pr-2">
          <PagosPrintable
            ref={printRef}
            pagos={pagos}
            monedaPrincipal={monedaPrincipal}
            totalIngresos={totalIngresos}
          />
        </div>

        <div className="pt-6 flex justify-end border-t border-gray-200 mt-6">
          <button
            onClick={imprimir}
            className="px-6 py-3.5 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out flex items-center gap-2"
          >
            <FaPrint size={18} /> Imprimir
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
