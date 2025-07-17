/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiX, FiPlus } from "react-icons/fi";
import { MdOutlinePayments } from "react-icons/md";
import { formatearMoneda } from "../../utils/formatearMonedaHelpers";
import { convertirDesdePrincipal } from "../../utils/conversionHelpers";

interface ModalPagoProps {
  orden: any;
  onClose: () => void;
  onPagoRegistrado: (nuevaOrden: any) => void;
  tasas: { VES?: number; COP?: number };
  monedaPrincipal: string;
}

export default function ModalPago({
  orden,
  onClose,
  onPagoRegistrado,
  tasas,
}: ModalPagoProps) {
  const [pagos, setPagos] = useState([
    { monto: 0, moneda: "USD", metodo: "Efectivo" },
  ]);
  const [proyeccionRestante, setProyeccionRestante] = useState<number | null>(
    null
  );

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

  const totalUSD = orden.total;
  const faltanteUSD = Math.max(totalUSD - totalPagadoUSD, 0);

  const metodoMap: Record<string, string> = {
    Efectivo: "EFECTIVO",
    Transferencia: "TRANSFERENCIA",
    "Pago móvil": "PAGO_MOVIL",
  };

  const registrarPago = async () => {
    const pagosValidos = pagos.filter(
      (p) => p.monto > 0 && p.moneda && p.metodo
    );

    if (pagosValidos.length === 0) {
      toast.error("Ingresa al menos un pago válido");
      return;
    }

    if (faltanteUSD <= 0) {
      toast.info("La orden ya ha sido saldada");
      return;
    }

    try {
      for (const p of pagosValidos) {
        await axios.post("/api/pagos", {
          ordenId: orden.id,
          monto: p.monto,
          metodoPago: metodoMap[p.metodo],
          moneda: p.moneda,
        });
      }

      toast.success("Pagos registrados exitosamente");

      const res = await axios.get("/api/ordenes");
      const actualizada = res.data.find((o: any) => o.id === orden.id);
      onPagoRegistrado(actualizada);
      onClose();
    } catch (err) {
      toast.error("Error al registrar el pago");
      console.error("Pago error:", err);
    }
  };

  const actualizarPago = (
    idx: number,
    campo: "monto" | "moneda" | "metodo",
    valor: any
  ) => {
    const nuevos = [...pagos];
    if (campo === "monto") nuevos[idx].monto = parseFloat(valor) || 0;
    else nuevos[idx][campo] = valor;
    setPagos(nuevos);
  };

  const agregarPago = () => {
    const totalExtraUSD = pagos.reduce(
      (sum, p) => sum + convertirAUSD(p.monto, p.moneda),
      0
    );

    const nuevoRestante = Math.max(
      totalUSD - totalPagadoUSD - totalExtraUSD,
      0
    );

    setProyeccionRestante(nuevoRestante);
    setPagos([...pagos, { monto: 0, moneda: "USD", metodo: "Efectivo" }]);
  };

  const eliminarPago = (idx: number) => {
    const nuevaLista = pagos.filter((_, i) => i !== idx);
    setPagos(nuevaLista);
    setProyeccionRestante(null);
  };

  const restanteVES = convertirDesdePrincipal(
    proyeccionRestante ?? faltanteUSD,
    "VES",
    tasas,
    "USD"
  );

  const restanteCOP = convertirDesdePrincipal(
    proyeccionRestante ?? faltanteUSD,
    "COP",
    tasas,
    "USD"
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-lg font-bold text-green-700 flex items-center gap-2">
            <MdOutlinePayments />
            Registrar pago
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            title="Cerrar"
          >
            <FiX />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-6 text-sm text-gray-800">
          {/* Campos de pago */}
          {pagos.map((p, idx) => (
            <div
              key={idx}
              className="border border-gray-300 rounded-md p-4 bg-gray-50 shadow-sm relative space-y-4"
            >
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Monto</label>
                  <input
                    type="number"
                    value={p.monto || ""}
                    onChange={(e) =>
                      actualizarPago(idx, "monto", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                    placeholder="Ej. 20"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Moneda</label>
                  <select
                    value={p.moneda}
                    onChange={(e) =>
                      actualizarPago(idx, "moneda", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="VES">VES</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Método</label>
                  <select
                    value={p.metodo}
                    onChange={(e) =>
                      actualizarPago(idx, "metodo", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Pago móvil">Pago móvil</option>
                  </select>
                </div>
              </div>
              {pagos.length > 1 && (
                <button
                  onClick={() => eliminarPago(idx)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                  title="Eliminar"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}

          {/* Agregar otro pago */}
          <div className="flex justify-end">
            <button
              onClick={agregarPago}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
            >
              <FiPlus className="text-base" />
              Agregar otro pago
            </button>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm font-medium">
            <div>
              <span className="text-gray-500">Total</span>
              <span className="block text-green-700 font-semibold">
                {formatearMoneda(totalUSD, "USD")}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Abonado</span>
              <span className="block text-blue-700 font-semibold">
                {formatearMoneda(totalPagadoUSD, "USD")}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Faltante actual</span>
              <span className="block text-red-600 font-semibold">
                {formatearMoneda(faltanteUSD, "USD")}
              </span>
            </div>
          </div>

          {/* Proyección local */}
          <div className="bg-gray-50 border border-gray-300 rounded-md p-4 shadow-sm ring-1 ring-gray-100 space-y-3">
            <p className="font-semibold text-gray-700">
              Faltante proyectado en moneda local
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500">Bolívares (VES):</span>
                <span className="block text-red-700 font-semibold">
                  {formatearMoneda(restanteVES, "VES")}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Pesos (COP):</span>
                <span className="block text-red-700 font-semibold">
                  {formatearMoneda(restanteCOP, "COP")}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              Se actualiza automáticamente según los valores ingresados.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 flex justify-end gap-3 font-medium">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            Salir
          </button>
          <button
            onClick={registrarPago}
            disabled={faltanteUSD <= 0}
            className={`px-4 py-2 text-white rounded-md font-semibold transition ${
              faltanteUSD <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Guardar pagos
          </button>
        </div>
      </div>
    </div>
  );
}
