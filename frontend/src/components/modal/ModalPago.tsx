import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { MdOutlinePayments } from "react-icons/md";
import { toast } from "react-toastify";
import { pagosService } from "../../services/pagosService";
import { ordenesService } from "../../services/ordenesService";
import {
  convertirDesdePrincipal,
  convertirAmonedaPrincipal,
  normalizarMoneda,
  formatearMoneda,
  type Moneda,
  type TasasConversion,
} from "../../utils/monedaHelpers";
import { calcularResumenPago } from "../../../../shared/utils/pagoFinance";
import type { Orden, MetodoPago } from "../../types/types";

type PagoInput = {
  monto: number;
  moneda: Moneda;
  metodo: "Efectivo" | "Transferencia" | "Pago móvil";
};

const metodoPagoMap: Record<PagoInput["metodo"], MetodoPago> = {
  Efectivo: "EFECTIVO",
  Transferencia: "TRANSFERENCIA",
  "Pago móvil": "PAGO_MOVIL",
};

interface ModalPagoProps {
  orden: Orden;
  onClose: () => void;
  onPagoRegistrado: (ordenActualizada: Orden) => void;
  tasas: TasasConversion;
  monedaPrincipal: Moneda;
}

export default function ModalPago({
  orden,
  onClose,
  onPagoRegistrado,
  tasas,
  monedaPrincipal,
}: ModalPagoProps) {
  const [pagos, setPagos] = useState<PagoInput[]>([
    { monto: 0, moneda: "USD", metodo: "Efectivo" } as PagoInput,
  ]);
  const [proyeccionRestante, setProyeccionRestante] = useState<number | null>(
    null
  );

  const principalSegura: Moneda = normalizarMoneda(monedaPrincipal);
  const resumen = calcularResumenPago(orden, tasas, principalSegura);

  const registrarPago = async () => {
    const totalExtraUSD = pagos.reduce(
      (sum, p) => sum + convertirAmonedaPrincipal(p.monto, p.moneda, tasas),
      0
    );
    const nuevoRestante = Math.max(resumen.faltante - totalExtraUSD, 0);
    setProyeccionRestante(nuevoRestante);

    const pagosValidos = pagos.filter(
      (p) => p.monto > 0 && p.moneda && p.metodo
    );

    if (pagosValidos.length === 0) {
      toast.error("Ingresa al menos un pago válido");
      return;
    }
    if (resumen.faltante <= 0) {
      toast.info(
        "La orden ya ha sido saldada y no se pueden añadir más pagos."
      );
      onClose();
      return;
    }

    try {
      console.log("DEBUG: Intentando registrar pagos...");
      for (const p of pagosValidos) {
        await pagosService.create({
          ordenId: orden.id,
          monto: p.monto,
          moneda: p.moneda,
          metodoPago: metodoPagoMap[p.metodo],
        });
      }

      toast.success("Pagos registrados exitosamente");

      const res = await ordenesService.getById(orden.id);
      const actualizada = res.data;

      if (actualizada) {
        onPagoRegistrado(actualizada);
        if (actualizada.estadoPago === "COMPLETO") {
          toast.info("¡La orden ha sido saldada por completo!");
        }
      }
      onClose();
    } catch (err) {
      toast.error("Error al registrar el pago");
      console.error("Error pago:", err);
    }
  };

  const actualizarPago = (
    idx: number,
    campo: keyof PagoInput,
    valor: string
  ) => {
    const nuevos = [...pagos];

    if (campo === "monto") {
      nuevos[idx].monto = parseFloat(valor) || 0;
    } else if (campo === "moneda") {
      nuevos[idx].moneda = valor as Moneda;
    } else if (campo === "metodo") {
      nuevos[idx].metodo = valor as PagoInput["metodo"];
    }

    setPagos(nuevos);
  };

  const agregarPago = () => {
    const nuevosPagos = [
      ...pagos,
      { monto: 0, moneda: "USD", metodo: "Efectivo" } as PagoInput,
    ];
    setPagos(nuevosPagos);

    const totalExtraUSD = nuevosPagos.reduce(
      (sum, p) => sum + convertirAmonedaPrincipal(p.monto, p.moneda, tasas),
      0
    );
    const nuevoRestante = Math.max(resumen.faltante - totalExtraUSD, 0);
    setProyeccionRestante(nuevoRestante);
  };

  const eliminarPago = (idx: number) => {
    const nuevaLista = pagos.filter((_, i) => i !== idx);
    setPagos(nuevaLista);

    if (nuevaLista.length > 0) {
      const totalExtraUSD = nuevaLista.reduce(
        (sum, p) => sum + convertirAmonedaPrincipal(p.monto, p.moneda, tasas),
        0
      );
      const nuevoRestante = Math.max(resumen.faltante - totalExtraUSD, 0);
      setProyeccionRestante(nuevoRestante);
    } else {
      setProyeccionRestante(null);
    }
  };

  const faltanteActual = proyeccionRestante ?? resumen.faltante;
  const restanteVES = convertirDesdePrincipal(
    faltanteActual,
    "VES",
    tasas,
    principalSegura
  );
  const restanteCOP = convertirDesdePrincipal(
    faltanteActual,
    "COP",
    tasas,
    principalSegura
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

        {/* Formulario */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-6 text-sm text-gray-800">
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
                    step="0.01"
                    value={p.monto === 0 ? "" : p.monto}
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

          {/* Botón agregar */}
          <div className="flex justify-end">
            <button
              onClick={agregarPago}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
            >
              <FiPlus className="text-base" />
              Agregar otro pago
            </button>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm font-medium">
            <div>
              <span className="text-gray-500">Total</span>
              <span className="block text-green-700 font-semibold">
                {formatearMoneda(orden.total, principalSegura)}{" "}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Abonado</span>
              <span className="block text-blue-700 font-semibold">
                {formatearMoneda(resumen.abonado, principalSegura)}{" "}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Faltante actual</span>
              <span className="block text-red-600 font-semibold">
                {formatearMoneda(resumen.faltante, principalSegura)}{" "}
              </span>
            </div>
          </div>

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
            disabled={faltanteActual <= 0}
            className={`px-4 py-2 text-white rounded-md font-semibold transition ${
              faltanteActual <= 0
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
