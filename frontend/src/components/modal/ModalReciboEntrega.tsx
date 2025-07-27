import { FiX } from "react-icons/fi";
import { FaPrint } from "react-icons/fa";
import ReciboEntrega from "../ReciboEntrega";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { createPortal } from "react-dom";
import { type Moneda } from "../../utils/monedaHelpers";

interface ReciboItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

interface ReciboClienteInfo {
  nombre: string;
  apellido: string;
  identificacion: string;
  fechaIngreso: string | Date;
  fechaEntrega?: string | Date | null;
}

interface ReciboLavanderiaInfo {
  nombre: string;
  rif: string | null;
  direccion: string | null;
  telefonoPrincipal: string | null;
  telefonoSecundario: string | null;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  datosRecibo: {
    clienteInfo: ReciboClienteInfo;
    items: ReciboItem[];
    abono: number;
    total: number;
    lavanderiaInfo: ReciboLavanderiaInfo;
    numeroOrden?: number;
    observaciones?: string | null;
    mensajePieRecibo?: string | null;
    monedaPrincipal: Moneda;
  };
};

export default function ModalReciboEntrega({
  visible,
  onClose,
  datosRecibo,
}: Props) {
  const reciboRef = useRef<HTMLDivElement>(null);

  const imprimir = useReactToPrint({
    contentRef: reciboRef,
    pageStyle: `
      @media print {
        body {
          width: 58mm;
          margin: 0;
          padding: 0;
        }
        .recibo {
          font-size: 11px;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
    onAfterPrint: () => console.log("Recibo impreso exitosamente!"),
    documentTitle: `Recibo_Orden_${datosRecibo.numeroOrden || ""}`,
  });

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[999] p-4 sm:p-6 print:hidden">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative text-base transform transition-all duration-300 scale-100 opacity-100 ring-1 ring-gray-200 flex flex-col h-[90vh]">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6 **flex-shrink-0**">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaPrint size={28} className="text-blue-600" /> Vista previa de
            recibo
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
          <ReciboEntrega
            ref={reciboRef}
            clienteInfo={datosRecibo.clienteInfo}
            items={datosRecibo.items}
            abono={datosRecibo.abono}
            total={datosRecibo.total}
            lavanderiaInfo={datosRecibo.lavanderiaInfo}
            numeroOrden={datosRecibo.numeroOrden}
            observaciones={datosRecibo.observaciones}
            mensajePieRecibo={datosRecibo.mensajePieRecibo}
            monedaPrincipal={datosRecibo.monedaPrincipal}
          />
        </div>

        <div className="pt-6 flex justify-end border-t border-gray-200 mt-6 **flex-shrink-0**">
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
