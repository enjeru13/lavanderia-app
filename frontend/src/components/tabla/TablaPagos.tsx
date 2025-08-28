import { FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { formatearMoneda } from "../../utils/monedaHelpers";
import type {
  Moneda,
  Pago,
  Orden,
  MetodoPago,
} from "@lavanderia/shared/types/types";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

interface PagoConOrden extends Pago {
  orden?: Orden & { cliente?: { nombre: string; apellido: string } };
}

type SortKeys = "fechaPago" | "ordenId" | "monto";
type SortDirection = "asc" | "desc";

interface Props {
  pagos: PagoConOrden[];
  monedaPrincipal: Moneda;
  sortColumn: SortKeys | null;
  sortDirection: SortDirection;
  cargandoOrdenDetalle: boolean;
  onSort: (column: SortKeys) => void;
  onVerDetallesOrden: (ordenId: number) => void;
}

const metodoPagoDisplay: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  PAGO_MOVIL: "Pago móvil",
};

export default function TablaPagos({
  pagos,
  sortColumn,
  sortDirection,
  cargandoOrdenDetalle,
  onSort,
  onVerDetallesOrden,
}: Props) {
  const getSortIcon = (column: SortKeys) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
          <tr className="text-left">
            <th
              className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
              onClick={() => onSort("fechaPago")}
            >
              <div className="flex items-center gap-1">
                Fecha {getSortIcon("fechaPago")}
              </div>
            </th>
            <th
              className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
              onClick={() => onSort("ordenId")}
            >
              <div className="flex items-center gap-1">
                Orden {getSortIcon("ordenId")}
              </div>
            </th>
            <th className="px-4 py-2 font-semibold">Cliente</th>
            <th className="px-4 py-2 font-semibold whitespace-nowrap">
              Método
            </th>
            <th className="px-4 py-2 font-semibold whitespace-nowrap">
              Moneda
            </th>
            <th
              className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
              onClick={() => onSort("monto")}
            >
              <div className="flex items-center gap-1">
                Monto abonado {getSortIcon("monto")}
              </div>
            </th>
            <th className="px-4 py-2 font-semibold text-center whitespace-nowrap">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {pagos.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-10 text-center text-gray-500 italic bg-white"
              >
                No se encontraron pagos registrados.
              </td>
            </tr>
          ) : (
            pagos.map((pago) => {
              const monedaSegura: Moneda = pago.moneda;
              return (
                <tr
                  key={pago.id}
                  className="border-t border-gray-100 hover:bg-blue-50 transition-colors duration-150 text-gray-700 font-semibold"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dayjs(pago.fechaPago).format("DD MMM YYYY")}
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">
                    #{pago.ordenId}
                  </td>
                  <td className="px-4 py-3">
                    {pago.orden?.cliente?.nombre}{" "}
                    {pago.orden?.cliente?.apellido}
                  </td>
                  <td className="px-4 py-3 capitalize whitespace-nowrap">
                    {metodoPagoDisplay[pago.metodoPago]}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {monedaSegura}
                  </td>
                  <td className="px-4 py-3 text-green-700 font-semibold whitespace-nowrap">
                    {formatearMoneda(pago.monto, monedaSegura)}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onVerDetallesOrden(pago.ordenId)}
                      title="Ver detalles de la orden"
                      className="p-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                      disabled={cargandoOrdenDetalle}
                    >
                      <FaSearch size={12} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
