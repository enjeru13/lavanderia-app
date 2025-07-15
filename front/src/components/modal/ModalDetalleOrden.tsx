/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { BiMessageSquareDetail } from "react-icons/bi";
import { formatearMoneda } from "../../utils/formatearMonedaHelpers";
import { badgeEstado } from "../../utils/badgeHelpers";
import { toast } from "react-toastify";

interface Props {
  orden: any;
  onClose: () => void;
  onPagoRegistrado: (nuevaOrden: any) => void;
  onAbrirPagoExtra: (orden: any) => void;
  tasas: { VES?: number; COP?: number };
  monedaPrincipal: string;
}

export default function ModalDetalleOrden({
  orden,
  onClose,
  tasas,
  onAbrirPagoExtra,
  monedaPrincipal,
  onPagoRegistrado,
}: Props) {
  const [observacionesEditadas, setObservacionesEditadas] = useState(
    orden.observaciones ?? ""
  );
  const [guardandoObservaciones, setGuardandoObservaciones] = useState(false);

  const convertirAUSD = (monto: number, moneda: string): number => {
    if (moneda === "USD") return monto;
    if (moneda === "VES") return monto / (tasas.VES || 1);
    if (moneda === "COP") return monto / (tasas.COP || 1);
    return monto;
  };

  const totalPagadoUSD =
    orden.pagos?.reduce(
      (sum: number, p: any) => sum + convertirAUSD(p.monto, p.moneda),
      0
    ) || 0;

  const faltanteUSD = Math.max(orden.total - totalPagadoUSD, 0);

  const guardarObservaciones = async () => {
    if (observacionesEditadas === orden.observaciones) {
      toast.info("No hay cambios en las observaciones");
      return;
    }
    setGuardandoObservaciones(true);
    try {
      await axios.put(`/api/ordenes/${orden.id}`, {
        observaciones: observacionesEditadas,
      });

      const res = await axios.get(`/api/ordenes/${orden.id}`);
      toast.success("Observaciones actualizadas correctamente");
      onPagoRegistrado(res.data);
    } catch (err) {
      toast.error("Error al guardar las observaciones");
      console.error(err);
    } finally {
      setGuardandoObservaciones(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white max-w-2xl w-full p-6 rounded-lg shadow-xl ring-1 ring-gray-200 space-y-6 text-sm text-gray-800 overflow-auto max-h-[90vh]">
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
            <BiMessageSquareDetail />
            Detalle de la orden{" "}
            <span className="text-gray-500">#{orden.id}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            <FiX />
          </button>
        </div>

        {/* Cliente & Estado */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-700 font-semibold text-sm py-1">Cliente</p>
            <div className="bg-gray-50 p-3 rounded border font-medium">
              {orden.cliente?.nombre} {orden.cliente?.apellido}
            </div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm py-1">
              Estado de la entrega
            </p>
            <div className="bg-gray-50 px-3 py-2 rounded border flex items-center gap-2">
              {badgeEstado(orden.estado)}
            </div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm py-1">
              Fecha de ingreso
            </p>
            <div className="bg-gray-50 p-3 rounded border">
              {new Date(orden.fechaIngreso).toLocaleDateString()}
            </div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm py-1">
              Fecha estimada de entrega
            </p>
            <div className="bg-gray-50 p-3 rounded border">
              {orden.fechaEntrega
                ? new Date(orden.fechaEntrega).toLocaleDateString()
                : "No definida"}
            </div>
          </div>
        </div>

        {/* Servicios contratados */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Servicios contratados
          </h3>
          <div className="divide-y border rounded-lg overflow-hidden text-sm">
            {orden.detalles?.map((d: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-white hover:bg-gray-50 transition"
              >
                <span>{d.servicio?.nombreServicio}</span>
                <span className="text-gray-500">x{d.cantidad}</span>
                <span className="font-semibold">
                  {formatearMoneda(d.subtotal, monedaPrincipal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagos realizados */}
        {orden.pagos?.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">
              Pagos realizados
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {orden.pagos.map((p: any) => (
                <li key={p.id} className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span>{new Date(p.fechaPago).toLocaleDateString()}</span>
                    <span className="font-semibold">
                      {formatearMoneda(p.monto, p.moneda)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 italic mt-1">
                    Pago en {p.moneda} vía {p.metodoPago}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notas de la orden */}
        <div className="pt-4 border-t space-y-3">
          <h3 className="font-semibold text-gray-700 mb-1">
            Notas de la orden
          </h3>
          <textarea
            value={observacionesEditadas}
            onChange={(e) => setObservacionesEditadas(e.target.value)}
            placeholder="Sin notas registradas..."
            disabled={guardandoObservaciones}
            className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring focus:ring-indigo-200 resize-y text-sm"
          />
          <p className="text-xs text-gray-500 italic">
            Puedes agregar comentarios, aclaraciones o notas internas sobre la
            orden.
          </p>
          <div className="flex justify-end">
            <button
              onClick={guardarObservaciones}
              disabled={
                guardandoObservaciones ||
                observacionesEditadas === orden.observaciones
              }
              className={`p-3 flex items-center gap-2 text-white font-bold rounded-md ${
                observacionesEditadas === orden.observaciones ||
                guardandoObservaciones
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Guardar notas
            </button>
          </div>
        </div>

        {/* Acción: registrar pago adicional */}
        {orden.estado === "ENTREGADO" && faltanteUSD > 0 && (
          <div className="pt-5 border-t mt-6 space-y-2">
            <h4 className="text-sm text-gray-600 font-semibold">
              Registrar nuevo pago
            </h4>
            <button
              onClick={() => onAbrirPagoExtra(orden)}
              className="p-3 bg-green-600 text-white rounded font-bold hover:bg-green-700 text-sm flex items-center gap-2"
            >
              Agregar pago adicional
            </button>
            <p className="text-xs text-gray-500">
              La orden fue entregada pero aún queda saldo pendiente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
