/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiX, FiPlus } from "react-icons/fi";
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white max-w-lg w-full p-6 rounded-lg shadow-xl ring-1 ring-gray-200 space-y-6 text-sm text-gray-800">
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-green-600 flex items-center gap-2">
            Registrar pago
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            <FiX />
          </button>
        </div>

        {/* Pagos */}
        {pagos.map((p, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row gap-2 items-center"
          >
            <input
              type="number"
              value={p.monto || ""}
              placeholder="Monto"
              onChange={(e) => actualizarPago(idx, "monto", e.target.value)}
              className="flex-1 border px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
            <select
              value={p.moneda}
              onChange={(e) => actualizarPago(idx, "moneda", e.target.value)}
              className="w-24 border px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            >
              <option disabled value="">
                Moneda
              </option>
              <option value="USD">USD</option>
              <option value="VES">VES</option>
              <option value="COP">COP</option>
            </select>
            <select
              value={p.metodo}
              onChange={(e) => actualizarPago(idx, "metodo", e.target.value)}
              className="w-32 border px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            >
              <option disabled value="">
                Tipo de pago
              </option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Pago móvil">Pago móvil</option>
            </select>
            <button
              onClick={() => eliminarPago(idx)}
              className="text-red-500 hover:text-red-700 text-lg font-bold"
              title="Eliminar"
            >
              <FiX />
            </button>
          </div>
        ))}

        <button
          onClick={agregarPago}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          <FiPlus /> AGREGAR OTRO PAGO
        </button>

        {/* Resumen financiero */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-x-8 text-sm pt-2">
            <div className="flex flex-col">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-green-700">
                {formatearMoneda(totalUSD, "USD")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600">Abonado:</span>
              <span className="font-semibold text-blue-700">
                {formatearMoneda(totalPagadoUSD, "USD")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600">Faltante actual:</span>
              <span className="font-semibold text-red-600">
                {formatearMoneda(faltanteUSD, "USD")}
              </span>
            </div>
          </div>

          {/* Faltante estimado en moneda local */}
          <div className="bg-white border rounded-md p-4 mt-4 text-sm shadow-sm ring-1 ring-gray-100">
            <p className="font-semibold text-gray-700 mb-3">
              Faltante estimado en monedas locales
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-500 font-medium">
                  Bolívares (VES):
                </span>
                <span className="font-semibold text-red-700">
                  {formatearMoneda(restanteVES, "VES")}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-500 font-medium">Pesos (COP):</span>
                <span className="font-semibold text-red-700">
                  {formatearMoneda(restanteCOP, "COP")}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 pt-2 italic">
              Este monto se calcula según los pagos ingresados y se actualiza en
              tiempo real.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
          >
            Salir
          </button>
          <button
            onClick={registrarPago}
            className={`px-4 py-2 flex items-center gap-2 text-white rounded-md transition duration-150 ease-in-out ${
              faltanteUSD <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={faltanteUSD <= 0}
          >
            Guardar pagos
          </button>
        </div>
      </div>
    </div>
  );
}
