import { FiX } from "react-icons/fi";
import ReciboEntrega from "../ReciboEntrega";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

type Props = {
  visible: boolean;
  onClose: () => void;
  datosRecibo: {
    cliente: {
      nombre: string;
      identificacion: string;
      fechaIngreso: string | Date;
      fechaEntrega?: string | Date;
    };
    items: {
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
    }[];
    abono: number;
    total: number;
    lavanderia: {
      nombre: string;
      rif: string;
      direccion: string;
      telefono: string;
    };
    numeroOrden?: number;
    observaciones?: string;
    mostrarRecibidoPor?: boolean;
    recibidoPor?: string;
    mensajePieRecibo?: string;
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
    }
  `,
  });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-xs max-w-sm w-full relative print:hidden">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Cerrar modal"
        >
          <FiX size={18} />
        </button>

        {/* Recibo */}
        <div>
          <ReciboEntrega ref={reciboRef} {...datosRecibo} />
        </div>

        {/* Botón de impresión */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={imprimir}
            className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-green-700 transition"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
