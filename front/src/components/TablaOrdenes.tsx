import {
  FaSearch,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { obtenerEstadoPagoConvertido } from "../utils/pagoHelpers";
import { convertirAmonedaPrincipal } from "../utils/convertirMoneda";
import { badgeEstado, badgePago } from "../utils/badgeHelpers";

interface Orden {
  id: number;
  cliente?: { nombre: string; apellido: string };
  estado: string;
  fechaIngreso: string;
  fechaEntrega?: string;
  total: number;
  observaciones?: string;
  pagos?: { monto: number; moneda: string }[];
}

interface Props {
  ordenes: Orden[];
  tasas: { VES?: number; COP?: number };
  monedaPrincipal: string;
  onVerDetalles: (orden: Orden) => void;
  onRegistrarPago: (orden: Orden) => void;
  onMarcarEntregada: (id: number) => void;
  onEliminar: (id: number) => void;
}

export default function TablaOrdenes({
  ordenes,
  tasas,
  monedaPrincipal,
  onVerDetalles,
  onRegistrarPago,
  onMarcarEntregada,
  onEliminar,
}: Props) {
  return (
    <table className="w-full text-sm border rounded overflow-hidden bg-white shadow">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          <th className="px-4 py-2 text-left">Orden</th>
          <th className="px-4 py-2 text-left">Cliente</th>
          <th className="px-4 py-2 text-left">Estado</th>
          <th className="px-4 py-2 text-left">Pago</th>
          <th className="px-4 py-2 text-left">Ingreso</th>
          <th className="px-4 py-2 text-left">Entrega</th>
          <th className="px-4 py-2 text-left">Total</th>
          <th className="px-4 py-2 text-left">Observaciones</th>
          <th className="px-4 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ordenes.length === 0 ? (
          <tr>
            <td
              colSpan={9}
              className="px-4 py-6 text-center text-gray-500 italic"
            >
              No se encontraron órdenes
            </td>
          </tr>
        ) : (
          ordenes.map((o) => {
            const estadoPago = obtenerEstadoPagoConvertido(
              o,
              tasas,
              monedaPrincipal
            );
            const abonadoConvertido = o.pagos
              ? o.pagos.reduce(
                  (sum, p) =>
                    sum +
                    convertirAmonedaPrincipal(
                      p.monto,
                      p.moneda,
                      tasas,
                      monedaPrincipal
                    ),
                  0
                )
              : 0;
            const restante = Math.max(o.total - abonadoConvertido, 0);
            const estadoVisual =
              o.estado === "ENTREGADO" ? "ENTREGADO" : o.estado;

            return (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-600">#{o.id}</td>

                <td className="px-4 py-2">
                  {o.cliente?.nombre} {o.cliente?.apellido}
                </td>

                <td className="px-4 py-2">
                  <div className="flex flex-col gap-1">
                    {badgeEstado(estadoVisual)}
                    {badgePago(estadoPago)}
                  </div>
                </td>

                <td className="px-4 py-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-gray-500">
                      Abonado: ${abonadoConvertido.toFixed(2)} {monedaPrincipal}
                    </div>
                    <div className="text-red-600">
                      Falta: ${restante.toFixed(2)} {monedaPrincipal}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-2">
                  {new Date(o.fechaIngreso).toLocaleDateString()}
                </td>

                <td className="px-4 py-2">
                  {o.fechaEntrega
                    ? new Date(o.fechaEntrega).toLocaleDateString()
                    : "—"}
                </td>

                <td className="px-4 py-2 font-semibold">
                  ${o.total.toFixed(2)}
                </td>

                <td className="px-4 py-2 text-gray-600 max-w-[200px] truncate">
                  <span title={o.observaciones || "—"}>
                    {o.observaciones || "—"}
                  </span>
                </td>

                <td className="p-6">
                  <div className="grid grid-cols-2 gap-2 justify-center">
                    <button
                      onClick={() => onVerDetalles(o)}
                      title="Ver detalles"
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-0 flex items-center justify-center"
                    >
                      <FaSearch size={16} />
                    </button>

                    {estadoPago !== "Pagado" && o.estado !== "ENTREGADO" && (
                      <button
                        onClick={() => onRegistrarPago(o)}
                        title="Registrar pago"
                        className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-0 flex items-center justify-center"
                      >
                        <FaMoneyBillWave size={16} />
                      </button>
                    )}

                    {o.estado !== "ENTREGADO" && (
                      <button
                        onClick={() => onMarcarEntregada(o.id)}
                        title="Marcar entregada"
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-0 flex items-center justify-center"
                      >
                        <FaCheckCircle size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => onEliminar(o.id)}
                      title="Eliminar orden"
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-0 flex items-center justify-center"
                    >
                      <FaTrashAlt size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
