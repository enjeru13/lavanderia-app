import { useState } from "react";
import {
  FaSearch,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTrashAlt,
} from "react-icons/fa";
import ModalContraseña from "../modal/ModalContraseña";
import { badgeEstado, badgePago } from "../../utils/badgeHelpers";
import {
  formatearMoneda,
  type Moneda,
  normalizarMoneda,
} from "../../utils/monedaHelpers";
import type { Orden } from "../../types/types";

interface Props {
  ordenes: Orden[];
  monedaPrincipal: string;
  onVerDetalles: (orden: Orden) => void;
  onRegistrarPago: (orden: Orden) => void;
  onMarcarEntregada: (id: number) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

export default function TablaOrdenes({
  ordenes,
  monedaPrincipal,
  onVerDetalles,
  onRegistrarPago,
  onMarcarEntregada,
  onEliminar,
}: Props) {
  const [mostrarProteccion, setMostrarProteccion] = useState(false);
  const [ordenAEliminar, setOrdenAEliminar] = useState<Orden | null>(null);

  const principalSeguro: Moneda = normalizarMoneda(monedaPrincipal);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm rounded-xl shadow-md">
          <thead className="bg-gray-100 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3 text-left">Orden</th>
              <th className="px-6 py-3 text-left">Cliente</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Pago</th>
              <th className="px-6 py-3 text-left">Ingreso</th>
              <th className="px-6 py-3 text-left">Entrega</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Observaciones</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-10 text-center text-gray-500 italic"
                >
                  No se encontraron órdenes
                </td>
              </tr>
            ) : (
              ordenes.map((o) => (
                <tr
                  key={o.id}
                  className="border-t hover:bg-gray-50 transition-colors duration-100 font-medium"
                >
                  <td className="px-6 py-4 text-gray-800">#{o.id}</td>
                  <td className="px-6 py-4">
                    {o.cliente?.nombre} {o.cliente?.apellido}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {badgeEstado(o.estado)}
                      {badgePago(o.estadoPago)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs space-y-0.5">
                    <div className="text-gray-500">
                      Abonado:{" "}
                      {formatearMoneda(o.abonado ?? 0, principalSeguro)}
                    </div>
                    <div className="text-red-600">
                      Falta: {formatearMoneda(o.faltante ?? 0, principalSeguro)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(o.fechaIngreso).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {o.fechaEntrega
                      ? new Date(o.fechaEntrega).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-indigo-600 font-semibold">
                    {formatearMoneda(o.total ?? 0, principalSeguro)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-[220px] truncate">
                    <span title={o.observaciones ?? "—"}>
                      {o.observaciones ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onVerDetalles(o)}
                        title="Ver detalles"
                        className="px-2 py-2 bg-blue-50 border border-blue-400 text-blue-700 rounded-md hover:bg-blue-100 transition"
                      >
                        <FaSearch size={14} />
                      </button>

                      {o.estadoPago !== "COMPLETO" &&
                        o.estado !== "ENTREGADO" && (
                          <button
                            onClick={() => onRegistrarPago(o)}
                            title="Registrar pago"
                            className="px-2 py-2 bg-yellow-50 border border-yellow-400 text-yellow-700 rounded-md hover:bg-yellow-100 transition"
                          >
                            <FaMoneyBillWave size={14} />
                          </button>
                        )}

                      {o.estado !== "ENTREGADO" && (
                        <button
                          onClick={() => onMarcarEntregada(o.id)}
                          title="Marcar entregada"
                          className="px-2 py-2 bg-green-50 border border-green-400 text-green-700 rounded-md hover:bg-green-100 transition"
                        >
                          <FaCheckCircle size={14} />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setOrdenAEliminar(o);
                          setMostrarProteccion(true);
                        }}
                        title="Eliminar orden"
                        className="px-2 py-2 bg-red-50 border border-red-400 text-red-700 rounded-md hover:bg-red-100 transition"
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalContraseña
        visible={mostrarProteccion}
        onCancelar={() => {
          setMostrarProteccion(false);
          setOrdenAEliminar(null);
        }}
        onConfirmado={() => {
          if (ordenAEliminar) {
            onEliminar(ordenAEliminar.id);
          }
          setMostrarProteccion(false);
          setOrdenAEliminar(null);
        }}
        titulo={`Eliminar orden #${ordenAEliminar?.id}`}
      />
    </>
  );
}
