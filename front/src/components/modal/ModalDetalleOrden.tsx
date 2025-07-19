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
import ModalContraseña from "./ModalContraseña";
import ModalReciboEntrega from "./ModalReciboEntrega";
import { toast } from "react-toastify";
import { calcularResumenPago } from "../../../../shared/shared/utils/pagoFinance";
import type { Orden, Configuracion } from "../../types/types";

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
  const [mostrarProteccionNotas, setMostrarProteccionNotas] = useState(false);
  const [autorizadoParaEditar, setAutorizadoParaEditar] = useState(false);
  const [verModalRecibo, setVerModalRecibo] = useState(false);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(
    null
  );

  useEffect(() => {
    configuracionService
      .get()
      .then((res) => setConfiguracion(res.data))
      .catch((err) => {
        console.error("Error al cargar configuración del sistema", err);
        toast.error("Error al cargar configuración del sistema");
      });
  }, []);

  const principalSeguro: Moneda = normalizarMoneda(monedaPrincipal);

  const resumen = useMemo(
    () => calcularResumenPago(orden, tasas, principalSeguro),
    [orden, tasas, principalSeguro]
  );

  const guardarObservaciones = useCallback(async () => {
    if (observacionesEditadas === (orden.observaciones ?? "")) {
      toast.info("No hay cambios en las observaciones");
      return;
    }
    setGuardandoObservaciones(true);
    try {
      const obsPayload =
        observacionesEditadas === "" ? null : observacionesEditadas;
      await ordenesService.updateObservacion(orden.id, obsPayload);

      const res = await ordenesService.getById(orden.id);
      toast.success("Observaciones actualizadas correctamente");
      onPagoRegistrado(res.data);
    } catch (err) {
      toast.error("Error al guardar las observaciones");
      console.error(err);
    } finally {
      setGuardandoObservaciones(false);
    }
  }, [orden.id, orden.observaciones, observacionesEditadas, onPagoRegistrado]);

  useEffect(() => {
    if (autorizadoParaEditar) {
      guardarObservaciones();
      setAutorizadoParaEditar(false);
    }
  }, [autorizadoParaEditar, guardarObservaciones]);

  const generarDatosRecibo = () => ({
    clienteInfo: {
      nombre: orden.cliente?.nombre ?? "",
      apellido: orden.cliente?.apellido ?? "",
      identificacion: orden.cliente?.identificacion ?? "",
      fechaIngreso: orden.fechaIngreso,
      fechaEntrega: orden.fechaEntrega ?? null,
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
    observaciones: observacionesEditadas === "" ? null : observacionesEditadas,

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white max-w-2xl w-full p-6 rounded-lg shadow-xl ring-1 ring-gray-200 space-y-6 text-sm text-gray-800 overflow-auto max-h-[90vh]">
        {/* Encabezado */}
        <div className="flex justify-between items-center pb-2">
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

        {/* Cliente, Estado y Fechas */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-700 font-semibold text-sm py-1">Cliente</p>
            <div className="bg-gray-50 p-3 rounded border border-gray-300 font-medium">
              {orden.cliente?.nombre} {orden.cliente?.apellido}
            </div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm py-1">
              Estado de la entrega
            </p>
            <div className="bg-gray-50 px-3 py-2 rounded border border-gray-300 flex items-center gap-2">
              {badgeEstado(orden.estado)}
            </div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm py-1">
              Fecha de ingreso
            </p>
            <div className="bg-gray-50 p-3 rounded border border-gray-300">
              {new Date(orden.fechaIngreso).toLocaleDateString("es-VE")}
            </div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm py-1">
              Fecha estimada de entrega
            </p>
            <div className="bg-gray-50 p-3 rounded border border-gray-300">
              {orden.fechaEntrega
                ? new Date(orden.fechaEntrega).toLocaleDateString("es-VE")
                : "No definida"}
            </div>
          </div>
        </div>

        {/* Servicios contratados */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Servicios contratados
          </h3>
          <div className="divide-y border border-gray-300 rounded-lg overflow-hidden text-sm">
            {orden.detalles?.map((d, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-white hover:bg-gray-50 transition"
              >
                <span>
                  {d.servicio?.nombreServicio ?? "Servicio no disponible"}
                </span>{" "}
                <span className="text-gray-500">x{d.cantidad}</span>
                <span className="font-semibold">
                  {formatearMoneda(d.subtotal, principalSeguro)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagos realizados */}
        {(orden.pagos?.length ?? 0) > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">
              Pagos realizados
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {orden.pagos?.map((p) => (
                <li
                  key={p.id}
                  className="bg-gray-50 p-3 rounded border border-gray-300"
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {new Date(p.fechaPago).toLocaleDateString("es-VE")}
                    </span>{" "}
                    <span className="font-semibold">
                      {formatearMoneda(p.monto, p.moneda)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 italic mt-1">
                    Pago en {p.moneda} vía {p.metodoPago}{" "}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notas de la orden */}
        <div className="pt-4 space-y-3">
          <h3 className="font-semibold text-gray-700 mb-1">
            Notas de la orden
          </h3>
          <textarea
            value={observacionesEditadas}
            onChange={(e) => setObservacionesEditadas(e.target.value)}
            placeholder="Sin notas registradas..."
            disabled={guardandoObservaciones}
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring focus:ring-indigo-200 resize-y text-sm"
          />
          <p className="text-xs text-gray-500 italic">
            Puedes agregar comentarios, aclaraciones o notas internas sobre la
            orden.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setMostrarProteccionNotas(true)}
              disabled={
                guardandoObservaciones ||
                observacionesEditadas === (orden.observaciones ?? "")
              }
              className={`p-3 flex items-center gap-2 text-white font-bold rounded-md ${
                observacionesEditadas === (orden.observaciones ?? "") ||
                guardandoObservaciones
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Guardar notas
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setVerModalRecibo(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition text-sm"
            >
              Ver recibo de entrega
            </button>
          </div>

          {verModalRecibo && configuracion && (
            <ModalReciboEntrega
              visible={true}
              onClose={() => setVerModalRecibo(false)}
              datosRecibo={generarDatosRecibo()}
            />
          )}
        </div>

        {/* Pago adicional */}
        {orden.estado === "ENTREGADO" && resumen.faltante > 0 && (
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

      {/* Modal de autorización */}
      <ModalContraseña
        visible={mostrarProteccionNotas}
        onCancelar={() => setMostrarProteccionNotas(false)}
        onConfirmado={() => {
          setMostrarProteccionNotas(false);
          setAutorizadoParaEditar(true);
        }}
        titulo="Editar observaciones de la orden"
      />
    </div>
  );
}
