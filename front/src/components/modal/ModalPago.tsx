/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
  monedaPrincipal,
}: ModalPagoProps) {
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState("");
  const [moneda, setMoneda] = useState("");

  const metodoMap: Record<string, string> = {
    Efectivo: "EFECTIVO",
    Transferencia: "TRANSFERENCIA",
    "Pago móvil": "PAGO_MOVIL",
  };

  const montoConvertido = (() => {
    if (moneda === monedaPrincipal) return monto;
    if (moneda === "VES" && tasas.VES) return monto / tasas.VES;
    if (moneda === "COP" && tasas.COP) return monto / tasas.COP;
    return monto;
  })();

  const registrarPago = async () => {
    if (!monto || !metodoPago || !moneda) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      await axios.post("/api/pagos", {
        ordenId: orden.id,
        monto,
        metodoPago: metodoMap[metodoPago],
        moneda,
      });

      toast.success("Pago registrado exitosamente");

      const res = await axios.get("/api/ordenes");
      const actualizada = res.data.find((o: any) => o.id === orden.id);
      onPagoRegistrado(actualizada);
      setMonto(0);
      setMetodoPago("");
      setMoneda("");
    } catch (err) {
      toast.error("Error al registrar el pago");
      console.error("Pago error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-lg font-bold text-gray-800">
          💸 Registrar nuevo pago
        </h2>

        <div className="space-y-4">
          <label className="block text-sm text-gray-700">
            Monto abonado:
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="mt-1 w-full border px-3 py-2 rounded"
              min={0}
              placeholder="Ej. 10.00"
            />
          </label>

          {monto > 0 && moneda && (
            <p className="text-sm text-green-600">
              Equivale a{" "}
              <strong>
                ${montoConvertido.toFixed(2)} {monedaPrincipal}
              </strong>{" "}
              según tasa actual
            </p>
          )}

          <label className="block text-sm text-gray-700">
            Método de pago:
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded"
            >
              <option value="">Seleccionar</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Pago móvil">Pago móvil</option>
            </select>
          </label>

          <label className="block text-sm text-gray-700">
            Moneda:
            <select
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded"
            >
              <option value="">Seleccionar moneda</option>
              <option value="USD">Dólares (USD)</option>
              <option value="VES">Bolívares (VES)</option>
              <option value="COP">Pesos Colombianos (COP)</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={registrarPago}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
