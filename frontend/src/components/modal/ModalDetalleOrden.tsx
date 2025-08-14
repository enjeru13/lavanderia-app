import { useEffect, useState, useMemo, useCallback } from "react";
import { ordenesService } from "../../services/ordenesService";
import { configuracionService } from "../../services/configuracionService";
import { FiX } from "react-icons/fi";
import { BiMessageSquareDetail } from "react-icons/bi";
import {
  formatearMoneda,
  normalizarMoneda,
  type Moneda,
  type TasasConversion,
} from "../../utils/monedaHelpers";
import { badgeEstado } from "../../utils/badgeHelpers";
import { toast } from "react-toastify";
import { calcularResumenPago } from "@lavanderia/shared/utils/pagoFinance";
import type { Orden, Configuracion } from "@lavanderia/shared/types/types";
import { useAuth } from "../../hooks/useAuth";
import ModalReciboEntrega from "./ModalReciboEntrega";
import dayjs from "dayjs";

interface Props {
  orden: Orden;
  onClose: () => void;
  onPagoRegistrado: (nuevaOrden: Orden) => void;
  onAbrirPagoExtra: (orden: Orden) => void;
  tasas: TasasConversion;
  monedaPrincipal: Moneda;
}

export default function ModalDetalleOrden({
  orden,
  onClose,
  tasas,
  monedaPrincipal,
  onAbrirPagoExtra,
  onPagoRegistrado,
}: Props) {
  const [observacionesEditadas, setObservacionesEditadas] = useState(
    orden.observaciones ?? ""
  );
  const [guardandoObservaciones, setGuardandoObservaciones] = useState(false);
  const [verModalRecibo, setVerModalRecibo] = useState(false);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(
    null
  );
  const [cargandoConfiguracion, setCargandoConfiguracion] = useState(true);

  const { hasRole } = useAuth();

  useEffect(() => {
    setCargandoConfiguracion(true);
    configuracionService
      .get()
      .then((res) => setConfiguracion(res.data))
      .catch((err) => {
        console.error("Error al cargar configuración del sistema", err);
        toast.error("Error al cargar configuración del sistema");
      })
      .finally(() => {
        setCargandoConfiguracion(false);
      });
  }, []);

  const principalSeguro: Moneda = useMemo(
    () => normalizarMoneda(monedaPrincipal),
    [monedaPrincipal]
  );

  const resumen = useMemo(
    () => calcularResumenPago(orden, tasas, principalSeguro),
    [orden, tasas, principalSeguro]
  );

  const guardarObservaciones = useCallback(async () => {
    if (observacionesEditadas.trim() === (orden.observaciones ?? "").trim()) {
      toast.info("No hay cambios en las observaciones.");
      return;
    }

    if (!hasRole(["ADMIN"])) {
      toast.error("No tienes permiso para editar observaciones.");
      return;
    }

    setGuardandoObservaciones(true);
    try {
      const obsPayload =
        observacionesEditadas.trim() === ""
          ? null
          : observacionesEditadas.trim();
      await ordenesService.updateObservacion(orden.id, obsPayload);
      const res = await ordenesService.getById(orden.id);
      toast.success("Observaciones actualizadas correctamente.");
      onPagoRegistrado(res.data);
    } catch (err) {
      toast.error("Error al guardar las observaciones.");
      console.error(err);
    } finally {
      setGuardandoObservaciones(false);
    }
  }, [
    orden.id,
    orden.observaciones,
    observacionesEditadas,
    onPagoRegistrado,
    hasRole,
  ]);

  const generarDatosRecibo = () => ({
    clienteInfo: {
      nombre: orden.cliente?.nombre ?? "",
      apellido: orden.cliente?.apellido ?? "",
      identificacion: orden.cliente?.identificacion ?? "",
      fechaIngreso: dayjs(orden.fechaIngreso).isValid()
        ? dayjs(orden.fechaIngreso).toDate()
        : new Date(),
      fechaEntrega:
        orden.fechaEntrega && dayjs(orden.fechaEntrega).isValid()
          ? dayjs(orden.fechaEntrega).toDate()
          : null,
    },
    items:
      orden.detalles?.map((d) => ({
        descripcion: d.servicio?.nombreServicio ?? "Descripción no disponible",
        cantidad: d.cantidad,
        precioUnitario: d.precioUnit,
      })) ?? [],
    abono: resumen.abonado,
    total: orden.total,
    numeroOrden: orden.id,
    observaciones:
      observacionesEditadas.trim() === "" ? null : observacionesEditadas.trim(),

    lavanderiaInfo: {
      nombre: configuracion?.nombreNegocio ?? "Lavandería sin nombre",
      rif: configuracion?.rif ?? null,
      direccion: configuracion?.direccion ?? null,
      telefonoPrincipal: configuracion?.telefonoPrincipal ?? null,
      telefonoSecundario: configuracion?.telefonoSecundario ?? null,
    },
    mensajePieRecibo:
      configuracion?.mensajePieRecibo === ""
        ? null
        : configuracion?.mensajePieRecibo ?? null,
    monedaPrincipal: principalSeguro,
  });

  const isObservacionesDisabled = !hasRole(["ADMIN"]) || guardandoObservaciones;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="relative bg-white max-w-2xl w-full p-6 rounded-2xl shadow-2xl ring-1 ring-gray-200 space-y-6 text-base text-gray-800 overflow-auto max-h-[90vh] transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-extrabold text-green-700 flex items-center gap-3">
            <BiMessageSquareDetail className="text-3xl" />
            Detalle de la orden
            <span className="text-gray-500 font-semibold">#{orden.id}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-transform transform hover:rotate-90"
            title="Cerrar"
          >
            <FiX />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <p className="text-gray-700 font-semibold text-sm mb-2">Cliente</p>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 font-medium text-gray-900 shadow-sm">
              {orden.cliente?.nombre} {orden.cliente?.apellido}
            </div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm mb-2">
              Estado de la entrega
            </p>
            <div className="bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2 shadow-sm">
              {badgeEstado(orden.estado)}
            </div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm mb-2">
              Fecha de ingreso
            </p>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 font-medium text-gray-900 shadow-sm">
              {dayjs(orden.fechaIngreso).format("DD/MM/YYYY")}
            </div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm mb-2">
              Fecha estimada de entrega
            </p>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 font-medium text-gray-900 shadow-sm">
              {orden.fechaEntrega
                ? dayjs(orden.fechaEntrega).format("DD/MM/YYYY")
                : "No definida"}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-3">
            Servicios contratados
          </h3>
          <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {orden.detalles?.map((d, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition duration-200 ease-in-out"
              >
                <span className="font-medium text-gray-900">
                  {d.servicio?.nombreServicio ?? "Servicio no disponible"}
                </span>
                <span className="text-gray-500 text-sm">x{d.cantidad}</span>
                <span className="font-bold text-green-700">
                  {formatearMoneda(d.subtotal, principalSeguro)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {(orden.pagos?.length ?? 0) > 0 && (
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-3">
              Pagos realizados
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {orden.pagos?.map((p) => (
                <li
                  key={p.id}
                  className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-200 transition duration-200 ease-in-out"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900">
                      {dayjs(p.fechaPago).format("DD/MM/YYYY")}
                    </span>
                    <span className="font-bold text-indigo-700">
                      {formatearMoneda(p.monto, p.moneda)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    Pago en {p.moneda} vía {p.metodoPago}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6 space-y-3">
          <h3 className="font-bold text-gray-800 text-lg mb-3">
            Resumen de Pagos
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-medium">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg shadow-sm">
              <span className="text-blue-800">Total Orden:</span>
              <span className="font-bold text-blue-900">
                {formatearMoneda(orden.total, principalSeguro)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg shadow-sm">
              <span className="text-green-800">Total Abonado:</span>
              <span className="font-bold text-green-900">
                {formatearMoneda(resumen.abonado, principalSeguro)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg shadow-sm">
              <span className="text-red-800">Saldo Pendiente:</span>
              <span className="font-bold text-red-900">
                {formatearMoneda(resumen.faltante, principalSeguro)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3 border-t border-gray-200">
          <h3 className="font-bold text-gray-800 text-lg mb-3">
            Notas de la orden
          </h3>
          <textarea
            value={observacionesEditadas}
            onChange={(e) => setObservacionesEditadas(e.target.value)}
            placeholder="Sin notas registradas..."
            disabled={isObservacionesDisabled}
            className="w-full min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y text-sm transition duration-200"
          />
          <p className="text-xs text-gray-600 italic">
            Puedes agregar comentarios, aclaraciones o notas internas sobre la
            orden. Solo los administradores pueden editar.
          </p>
          <div className="flex justify-end pt-2">
            <button
              onClick={guardarObservaciones}
              disabled={
                isObservacionesDisabled ||
                observacionesEditadas.trim() ===
                  (orden.observaciones ?? "").trim()
              }
              className={`px-6 py-3 flex items-center gap-2 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out ${
                observacionesEditadas.trim() ===
                  (orden.observaciones ?? "").trim() || isObservacionesDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {guardandoObservaciones ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar notas"
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            onClick={() => setVerModalRecibo(true)}
            disabled={cargandoConfiguracion}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
              cargandoConfiguracion ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Ver recibo de entrega
          </button>

          {resumen.faltante > 0 && (
            <button
              onClick={() => onAbrirPagoExtra(orden)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-base flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
            >
              Registrar pago
            </button>
          )}
        </div>

        {verModalRecibo && configuracion && (
          <ModalReciboEntrega
            visible={true}
            onClose={() => setVerModalRecibo(false)}
            datosRecibo={generarDatosRecibo()}
          />
        )}
      </div>
    </div>
  );
}
