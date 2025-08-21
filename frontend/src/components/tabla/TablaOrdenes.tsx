import {
  FaSearch,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { badgeEstado, badgePago } from "../../utils/badgeHelpers";
import {
  formatearMoneda,
  type Moneda,
  normalizarMoneda,
} from "../../utils/monedaHelpers";
import type { Orden } from "@lavanderia/shared/types/types";
import { useAuth } from "../../hooks/useAuth";
import dayjs from "dayjs";

interface Props {
  ordenes: Orden[];
  monedaPrincipal: Moneda;
  onVerDetalles: (orden: Orden) => void;
  onRegistrarPago: (orden: Orden) => void;
  onMarcarEntregada: (id: number) => void;
  onEliminar: (id: number) => void;
}

export default function TablaOrdenes({
  ordenes,
  monedaPrincipal,
  onVerDetalles,
  onRegistrarPago,
  onMarcarEntregada,
  onEliminar,
}: Props) {
  const principalSeguro: Moneda = normalizarMoneda(monedaPrincipal);
  const { hasRole } = useAuth();

  return (
    <>
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap">Orden</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Cliente</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Estado</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Balance</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Ingreso</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Entrega</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                Entregado Por
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Total</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                Observaciones
              </th>
              <th className="px-4 py-2 text-right whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-10 text-center text-gray-500 italic bg-white"
                >
                  No se encontraron órdenes registradas.
                </td>
              </tr>
            ) : (
              ordenes.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-gray-100 hover:bg-blue-50 transition-colors duration-150 text-gray-700"
                >
                  <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">
                    #{o.id}
                  </td>
                  <td className="px-4 py-3">
                    {o.cliente?.nombre} {o.cliente?.apellido}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-start">
                      {badgeEstado(o.estado)}
                      {badgePago(o.estadoPago)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs space-y-0.5 whitespace-nowrap">
                    <div className="text-gray-600">
                      Abonado:
                      <span className="font-semibold">
                        {formatearMoneda(o.abonado ?? 0, principalSeguro)}
                      </span>
                    </div>
                    <div className="text-red-600">
                      Falta:
                      <span className="font-semibold">
                        {formatearMoneda(o.faltante ?? 0, principalSeguro)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dayjs(o.fechaIngreso).format("DD/MM/YYYY")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {o.fechaEntrega ? (
                      dayjs(o.fechaEntrega).format("DD/MM/YYYY")
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {o.estado === "ENTREGADO" && o.deliveredBy
                      ? o.deliveredBy.name || o.deliveredBy.email
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-indigo-700 font-extrabold whitespace-nowrap">
                    {formatearMoneda(o.total ?? 0, principalSeguro)}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-600 max-w-[120px] truncate"
                    title={o.observaciones ?? undefined}
                  >
                    {o.observaciones ?? (
                      <span className="text-gray-400 italic">
                        Sin observaciones
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onVerDetalles(o)}
                        title="Ver detalles de la orden"
                        className="p-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                      >
                        <FaSearch size={14} />
                      </button>

                      {o.estadoPago !== "COMPLETO" &&
                        o.estado !== "ENTREGADO" && (
                          <button
                            onClick={() => onRegistrarPago(o)}
                            title="Registrar pago"
                            className="p-2 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                          >
                            <FaMoneyBillWave size={14} />
                          </button>
                        )}

                      {o.estado !== "ENTREGADO" && (
                        <button
                          onClick={() => onMarcarEntregada(o.id)}
                          title="Marcar como entregada"
                          className="p-2 bg-green-100 border border-green-300 text-green-700 rounded-md hover:bg-green-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                        >
                          <FaCheckCircle size={14} />
                        </button>
                      )}

                      {hasRole(["ADMIN"]) && (
                        <button
                          onClick={() => onEliminar(o.id)}
                          title="Eliminar orden"
                          className="p-2 bg-red-100 border border-red-300 text-red-700 rounded-md hover:bg-red-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
