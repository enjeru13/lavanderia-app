import { FiX } from "react-icons/fi";
import { FaPrint } from "react-icons/fa";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import ReciboEntrega from "../ReciboEntrega";
import type { Moneda } from "../../utils/monedaHelpers";
const API_URL = import.meta.env.VITE_API_URL;

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
  const imprimirConServidor = async () => {
    try {
      const response = await fetch(`${API_URL}/imprimir-recibo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosRecibo),
      });

      if (response.ok) {
        toast.success("Recibo enviado a la impresora.");
        onClose();
      } else {
        const errorData = await response.json();
        console.error("Error del servidor de impresión:", errorData);
        toast.error("Error al imprimir. Revisa el servidor de impresión.");
      }
    } catch (error) {
      console.error("No se pudo conectar al servidor de impresión:", error);
      toast.error(
        "No se pudo conectar con la impresora. ¿Está el servidor activo?"
      );
    }
  };

  if (!visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[999] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative transform transition-all duration-300 flex flex-col h-[90vh] ring-1 ring-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center p-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaPrint size={28} className="text-blue-600" /> Vista previa de
            recibo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-3xl transition-transform transform hover:rotate-90 p-2 rounded-full hover:bg-gray-100"
            title="Cerrar"
          >
            <FiX size={28} />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          <ReciboEntrega
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

        <div className="flex-shrink-0 pt-6 px-6 pb-6 flex justify-end border-t border-gray-200">
          <button
            onClick={imprimirConServidor}
            className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-3 text-lg"
          >
            <FaPrint size={20} /> Imprimir
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
