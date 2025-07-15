/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FaSearch,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { badgeEstado, badgePago } from "../../utils/badgeHelpers";
import { formatearMoneda } from "../../utils/formatearMonedaHelpers";

interface Props {
  ordenes: any[];
  monedaPrincipal: string;
  onVerDetalles: (orden: any) => void;
  onRegistrarPago: (orden: any) => void;
  onMarcarEntregada: (id: number) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

export default function TablaOrdenes({
  ordenes,
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
            const estadoPago = o.estadoPago;

            return (
              <tr
                key={o.id}
                className="border-t font-semibold hover:bg-gray-50"
              >
                <td className="px-4 py-2 text-gray-600">#{o.id}</td>

                <td className="px-4 py-2">
                  {o.cliente?.nombre} {o.cliente?.apellido}
                </td>

                <td className="px-4 py-2">
                  <div className="flex flex-col gap-1">
                    {badgeEstado(o.estado)}
                    {badgePago(estadoPago)}
                  </div>
                </td>

                <td className="px-4 py-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-gray-500">
                      Abonado: {formatearMoneda(o.abonado ?? 0, "USD")}
                    </div>
                    <div className="text-red-600">
                      Falta: {formatearMoneda(o.faltante ?? 0, "USD")}
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

                <td className="px-4 py-2">
                  {formatearMoneda(o.total ?? 0, "USD")}
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
                      className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-0 flex items-center justify-center"
                    >
                      <FaSearch size={18} />
                    </button>

                    {estadoPago !== "COMPLETO" && o.estado !== "ENTREGADO" && (
                      <button
                        onClick={() => onRegistrarPago(o)}
                        title="Registrar pago"
                        className="p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-0 flex items-center justify-center"
                      >
                        <FaMoneyBillWave size={18} />
                      </button>
                    )}

                    {o.estado !== "ENTREGADO" && (
                      <button
                        onClick={() => onMarcarEntregada(o.id)}
                        title="Marcar entregada"
                        className="p-3 bg-green-600 text-white rounded hover:bg-green-700 transition duration-0 flex items-center justify-center"
                      >
                        <FaCheckCircle size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => onEliminar(o.id)}
                      title="Eliminar orden"
                      className="p-3 bg-red-600 text-white rounded hover:bg-red-700 transition duration-0 flex items-center justify-center"
                    >
                      <FaTrashAlt size={18} />
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
