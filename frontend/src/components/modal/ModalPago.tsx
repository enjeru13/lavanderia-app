import { useState, useMemo, useEffect } from "react";
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
import { calcularResumenPago } from "@lavanderia/shared/utils/pagoFinance";
import type { Orden, MetodoPago } from "@lavanderia/shared/types/types";

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
  const principalSegura: Moneda = useMemo(
    () => normalizarMoneda(monedaPrincipal),
    [monedaPrincipal]
  );
  const resumen = useMemo(
    () => calcularResumenPago(orden, tasas, principalSegura),
    [orden, tasas, principalSegura]
  );

  const [pagos, setPagos] = useState<PagoInput[]>([
    {
      monto: 0,
      moneda: "USD" as Moneda,
      metodo: "Efectivo" as PagoInput["metodo"],
    },
  ]);

  const totalPagosEnModalPrincipal = useMemo(() => {
    return pagos.reduce(
      (sum, p) =>
        sum +
        convertirAmonedaPrincipal(p.monto, p.moneda, tasas, principalSegura),
      0
    );
  }, [pagos, tasas, principalSegura]);

  const faltanteProyectado = useMemo(() => {
    return Math.max(resumen.faltante - totalPagosEnModalPrincipal, 0);
  }, [resumen.faltante, totalPagosEnModalPrincipal]);

  const [faltanteParaOtrasMonedas, setFaltanteParaOtrasMonedas] =
    useState<number>(resumen.faltante);

  useEffect(() => {
    setFaltanteParaOtrasMonedas(resumen.faltante);
  }, [resumen.faltante]);

  const restanteVES = useMemo(
    () =>
      convertirDesdePrincipal(
        faltanteParaOtrasMonedas,
        "VES",
        tasas,
        principalSegura
      ),
    [faltanteParaOtrasMonedas, tasas, principalSegura]
  );
  const restanteCOP = useMemo(
    () =>
      convertirDesdePrincipal(
        faltanteParaOtrasMonedas,
        "COP",
        tasas,
        principalSegura
      ),
    [faltanteParaOtrasMonedas, tasas, principalSegura]
  );

  const registrarPago = async () => {
    const pagosValidos = pagos.filter(
      (p) => p.monto > 0 && p.moneda && p.metodo
    );

    if (pagosValidos.length === 0) {
      toast.error("Ingresa al menos un pago válido.");
      return;
    }

    if (resumen.faltante <= 0) {
      toast.info("La orden ya ha sido saldada.");
      onClose();
      return;
    }

    if (totalPagosEnModalPrincipal > resumen.faltante + 0.01) {
      toast.warn("El monto total de los pagos excede el faltante de la orden.");
    }

    try {
      for (const p of pagosValidos) {
        await pagosService.create({
          ordenId: orden.id,
          monto: p.monto,
          moneda: p.moneda,
          metodoPago: metodoPagoMap[p.metodo],
        });
      }

      toast.success("Pagos registrados exitosamente.");

      const res = await ordenesService.getById(orden.id);
      const actualizada = res.data;

      if (actualizada) {
        onPagoRegistrado(actualizada);
      }
      onClose();
    } catch (err) {
      toast.error("Error al registrar el pago.");
      console.error("Error pago:", err);
    }
  };

  const actualizarPago = (
    idx: number,
    campo: keyof PagoInput,
    valor: string
  ) => {
    const nuevos = [...pagos];
    const pagoToUpdate: PagoInput = { ...nuevos[idx] };

    if (campo === "monto") {
      const valorLimpio = valor.replace(",", ".");
      pagoToUpdate.monto = parseFloat(valorLimpio) || 0;
    } else if (campo === "moneda") {
      pagoToUpdate.moneda = valor as Moneda;
    } else if (campo === "metodo") {
      pagoToUpdate.metodo = valor as PagoInput["metodo"];
    }

    nuevos[idx] = pagoToUpdate;
    setPagos(nuevos);
  };

  const agregarPago = () => {
    const newPagos = [
      ...pagos,
      {
        monto: 0,
        moneda: "USD" as Moneda,
        metodo: "Efectivo" as PagoInput["metodo"],
      },
    ];
    setPagos(newPagos);

    const newTotalInPrincipal = newPagos.reduce(
      (sum, p) =>
        sum +
        convertirAmonedaPrincipal(p.monto, p.moneda, tasas, principalSegura),
      0
    );
    setFaltanteParaOtrasMonedas(
      Math.max(resumen.faltante - newTotalInPrincipal, 0)
    );
  };

  const eliminarPago = (idx: number) => {
    const nuevaLista = pagos.filter((_, i) => i !== idx);
    setPagos(nuevaLista);

    const newTotalInPrincipal = nuevaLista.reduce(
      (sum, p) =>
        sum +
        convertirAmonedaPrincipal(p.monto, p.moneda, tasas, principalSegura),
      0
    );
    setFaltanteParaOtrasMonedas(
      Math.max(resumen.faltante - newTotalInPrincipal, 0)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-xl md:max-w-2xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-gray-200 transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-extrabold text-green-700 flex items-center gap-3">
            <MdOutlinePayments className="text-2xl sm:text-3xl" />
            Registrar pago
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-transform transform hover:rotate-90"
            title="Cerrar"
          >
            <FiX />
          </button>
        </div>

        {/* Formulario */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-6 text-base text-gray-800">
          {pagos.map((p, idx) => (
            <div
              key={idx}
              className="border border-gray-300 rounded-xl p-5 bg-gray-50 shadow-md relative space-y-4 transition-all duration-200 hover:shadow-lg"
            >
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor={`monto-${idx}`}
                    className="block text-sm text-gray-600 font-semibold mb-1"
                  >
                    Monto
                  </label>
                  <input
                    id={`monto-${idx}`}
                    type="text"
                    inputMode="decimal"
                    value={
                      p.monto === 0 ? "" : p.monto.toString().replace(".", ",")
                    }
                    onChange={(e) =>
                      actualizarPago(idx, "monto", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm"
                    placeholder="Ej. 20,50"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`moneda-${idx}`}
                    className="block text-sm text-gray-600 font-semibold mb-1"
                  >
                    Moneda
                  </label>
                  <select
                    id={`moneda-${idx}`}
                    value={p.moneda}
                    onChange={(e) =>
                      actualizarPago(idx, "moneda", e.target.value as Moneda)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="VES">VES</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`metodo-${idx}`}
                    className="block text-sm text-gray-600 font-semibold mb-1"
                  >
                    Método
                  </label>
                  <select
                    id={`metodo-${idx}`}
                    value={p.metodo}
                    onChange={(e) =>
                      actualizarPago(
                        idx,
                        "metodo",
                        e.target.value as PagoInput["metodo"]
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm"
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
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xl transition-transform transform hover:scale-110"
                  title="Eliminar pago"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}

          {/* Botón agregar */}
          <div className="flex justify-end pt-2">
            <button
              onClick={agregarPago}
              className="px-5 py-2 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
            >
              <FiPlus className="text-base" />
              Agregar otro pago
            </button>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="p-4 bg-blue-50 rounded-lg shadow-sm flex flex-col justify-between">
              <span className="text-sm text-blue-800 font-semibold mb-1">
                Total Orden:
              </span>
              <span className="block text-blue-900 font-bold text-xl">
                {formatearMoneda(orden.total, principalSegura)}
              </span>
            </div>
            <div className="p-4 bg-green-50 rounded-lg shadow-sm flex flex-col justify-between">
              <span className="text-sm text-green-800 font-semibold mb-1">
                Total Abonado:
              </span>
              <span className="block text-green-900 font-bold text-xl">
                {formatearMoneda(resumen.abonado, principalSegura)}
              </span>
            </div>
            {/* Monto de pagos en este modal */}
            <div className="p-4 bg-purple-50 rounded-lg shadow-sm flex flex-col justify-between">
              <span className="text-sm text-purple-800 font-semibold mb-1">
                Monto a abonar (este modal):
              </span>
              <span className="block text-purple-900 font-bold text-xl">
                {formatearMoneda(totalPagosEnModalPrincipal, principalSegura)}
              </span>
            </div>
            {/* Faltante proyectado */}
            <div className="sm:col-span-2 lg:col-span-3 p-4 bg-red-50 rounded-lg shadow-sm flex flex-col justify-between">
              <span className="text-sm text-red-800 font-semibold mb-1">
                Faltante proyectado:
              </span>
              <span className="block text-red-900 font-bold text-2xl">
                {formatearMoneda(faltanteProyectado, principalSegura)}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-inner ring-1 ring-gray-100 space-y-3 mt-6">
            <p className="font-bold text-gray-800 text-lg">
              Faltante proyectado en otras monedas:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-700">Bolívares (VES):</span>
                <span className="block text-red-700 font-bold text-lg">
                  {formatearMoneda(restanteVES, "VES")}
                </span>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-700">Pesos (COP):</span>
                <span className="block text-red-700 font-bold text-lg">
                  {formatearMoneda(restanteCOP, "COP")}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 italic">
              Estos valores se actualizan al agregar/eliminar pagos.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 flex justify-end gap-4 font-medium border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Salir
          </button>
          <button
            onClick={registrarPago}
            disabled={
              faltanteProyectado === resumen.faltante || faltanteProyectado < 0
            }
            className={`px-6 py-3 text-white rounded-lg font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
              faltanteProyectado === resumen.faltante || faltanteProyectado < 0
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
