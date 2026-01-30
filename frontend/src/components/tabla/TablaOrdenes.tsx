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
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 transition-all">
        <table className="min-w-full bg-white dark:bg-gray-900 text-sm transition-colors">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700 transition-colors">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap">Orden</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Cliente</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Estado</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Balance</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Ingreso</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Entrega</th>
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
                  colSpan={9}
                  className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic bg-white dark:bg-gray-900 transition-colors"
                >
                  No se encontraron órdenes registradas.
                </td>
              </tr>
            ) : (
              ordenes.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 text-gray-700 dark:text-gray-300"
                >
                  <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
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
                    {o.faltante === 0 ? (
                      <div className="text-green-600 dark:text-green-400 font-semibold">
                        Total pagado
                      </div>
                    ) : (
                      <>
                        <div className="text-gray-600 dark:text-gray-400">
                          Abonado:
                          <span className="font-semibold ml-1">
                            {formatearMoneda(o.abonado ?? 0, principalSeguro)}
                          </span>
                        </div>
                        <div className="text-red-600 dark:text-red-400">
                          Falta:
                          <span className="font-semibold ml-1">
                            {formatearMoneda(o.faltante ?? 0, principalSeguro)}
                          </span>
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dayjs(o.fechaIngreso).format("DD/MM/YYYY")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                    {o.fechaEntrega ? (
                      dayjs(o.fechaEntrega).format("DD/MM/YYYY")
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-indigo-700 dark:text-indigo-400 font-extrabold whitespace-nowrap">
                    {formatearMoneda(o.total ?? 0, principalSeguro)}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[120px] truncate"
                    title={o.observaciones ?? undefined}
                  >
                    {o.observaciones ?? (
                      <span className="text-gray-400 dark:text-gray-600 italic">
                        Sin observaciones
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onVerDetalles(o)}
                        title="Ver detalles de la orden"
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm cursor-pointer"
                      >
                        <FaSearch size={12} />
                      </button>

                      {o.estadoPago !== "COMPLETO" &&
                        o.estado !== "ENTREGADO" && (
                          <button
                            onClick={() => onRegistrarPago(o)}
                            title="Registrar pago"
                            className="p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm cursor-pointer"
                          >
                            <FaMoneyBillWave size={12} />
                          </button>
                        )}

                      {o.estado !== "ENTREGADO" && (
                        <button
                          onClick={() => onMarcarEntregada(o.id)}
                          title="Marcar como entregada"
                          className="p-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm cursor-pointer"
                        >
                          <FaCheckCircle size={12} />
                        </button>
                      )}

                      {hasRole(["ADMIN"]) && (
                        <button
                          onClick={() => onEliminar(o.id)}
                          title="Eliminar orden"
                          className="p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm cursor-pointer"
                        >
                          <FaTrashAlt size={12} />
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
