import { FiX } from "react-icons/fi";
import ReciboEntrega from "../ReciboEntrega";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
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
