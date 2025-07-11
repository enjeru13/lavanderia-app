/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalPago from "../components/modal/ModalPago";
import TablaOrdenes from "../components/tabla/TablaOrdenes";
import { obtenerEstadoPagoConvertido } from "../utils/pagoHelpers";
import { badgeEstado } from "../utils/badgeHelpers";

export default function PantallaOrdenes() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [tasas, setTasas] = useState<{ VES?: number; COP?: number }>({});
  const [monedaPrincipal, setMonedaPrincipal] = useState("USD");

  const metodoLabelMap: Record<string, string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
    PAGO_MOVIL: "Pago móvil",
  };

  const cargarOrdenes = () => {
    axios
      .get("/api/ordenes")
      .then((res) => setOrdenes(res.data))
      .catch((err) => console.error("Error al cargar órdenes:", err));
  };

  const cargarConfiguracion = async () => {
    try {
      const res = await axios.get("/api/configuracion");
      const config = res.data;
      setMonedaPrincipal(config.monedaPrincipal || "USD");
      setTasas({
        VES: config.tasaVES || undefined,
        COP: parseFloat(config.tasaCOP || "0"),
      });
    } catch (err) {
      console.error("Error al cargar configuración:", err);
    }
  };

  useEffect(() => {
    cargarOrdenes();
    cargarConfiguracion();
  }, []);

const ordenesFiltradas = ordenes.filter((o) => {
  const nombre = `${o.cliente?.nombre || ""} ${o.cliente?.apellido || ""}`.toLowerCase();
  const id = o.id.toString();
  const termino = busqueda.toLowerCase();

  return nombre.includes(termino) || id.includes(termino);
});

  const eliminarOrden = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta orden?")) return;
    try {
      await axios.delete(`/api/ordenes/${id}`);
      toast.success("Orden eliminada correctamente");
      cargarOrdenes();
    } catch (err) {
      toast.error("Error al eliminar la orden");
    }
  };

  const marcarComoEntregada = async (id: number) => {
    try {
      await axios.put(`/api/ordenes/${id}`, { estado: "ENTREGADO" });
      toast.success("Orden marcada como entregada");
      cargarOrdenes();
    } catch (err) {
      toast.error("Error al actualizar estado");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Historial de Órdenes</h1>

      <input
        type="text"
        placeholder="Buscar por cliente o número de orden"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="px-3 py-2 border rounded w-1/2"
      />

      <TablaOrdenes
        ordenes={ordenesFiltradas}
        tasas={tasas}
        monedaPrincipal={monedaPrincipal}
        onVerDetalles={setOrdenSeleccionada}
        onRegistrarPago={(orden) => {
          setOrdenSeleccionada(orden);
          setMostrarModalPago(true);
        }}
        onMarcarEntregada={marcarComoEntregada}
        onEliminar={eliminarOrden}
      />

      {ordenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full overflow-auto max-h-[90vh] space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🧾 Detalle de la Orden
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <span className="font-semibold text-gray-600 block mb-1">
                  Cliente:
                </span>
                <div className="bg-gray-100 px-3 py-1 rounded">
                  {ordenSeleccionada.cliente?.nombre}{" "}
                  {ordenSeleccionada.cliente?.apellido}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">
                  Estado:
                </span>
                <div className="flex gap-2 items-center">
                  {badgeEstado(ordenSeleccionada.estado)}
                  <span className="text-xs text-gray-500">
                    (
                    {obtenerEstadoPagoConvertido(
                      ordenSeleccionada,
                      tasas,
                      monedaPrincipal
                    )}
                    )
                  </span>
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">
                  Fecha ingreso:
                </span>
                {new Date(ordenSeleccionada.fechaIngreso).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">
                  Fecha entrega estimada:
                </span>
                {ordenSeleccionada.fechaEntrega ? (
                  new Date(ordenSeleccionada.fechaEntrega).toLocaleDateString()
                ) : (
                  <span className="text-gray-400 italic">No definida</span>
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-600 block mb-1">
                  Observaciones:
                </span>
                <div className="bg-gray-50 px-3 py-2 rounded min-h-[40px]">
                  {ordenSeleccionada.observaciones || (
                    <span className="text-gray-400 italic">
                      Sin observaciones
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Servicios</h3>
              <table className="w-full text-sm border rounded overflow-hidden">
                <thead className="bg-gray-100 text-gray-600 text-left">
                  <tr>
                    <th className="px-3 py-2">Servicio</th>
                    <th className="px-3 py-2">Cantidad</th>
                    <th className="px-3 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenSeleccionada.detalles?.map((d: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2">
                        {d.servicio?.nombreServicio}
                      </td>
                      <td className="px-3 py-2">{d.cantidad}</td>
                      <td className="px-3 py-2">${d.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ordenSeleccionada.pagos?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Pagos realizados
                </h3>
                <ul className="space-y-1 text-sm text-gray-700 list-disc pl-5">
                  {ordenSeleccionada.pagos.map((p: any) => (
                    <li key={p.id}>
                      {new Date(p.fechaPago).toLocaleDateString()} — $
                      {p.monto.toFixed(2)} vía{" "}
                      {metodoLabelMap[p.metodoPago] || p.metodoPago}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-right text-lg font-semibold text-green-700">
              Total: ${ordenSeleccionada.total.toFixed(2)}
            </div>

            <div className="text-right flex gap-2 justify-end pt-4">
              {obtenerEstadoPagoConvertido(
                ordenSeleccionada,
                tasas,
                monedaPrincipal
              ) !== "Pagado" && (
                <button
                  onClick={() => setMostrarModalPago(true)}
                  className="bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-600"
                >
                  Registrar pago
                </button>
              )}
              <button
                onClick={() => setOrdenSeleccionada(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalPago && ordenSeleccionada && (
        <ModalPago
          orden={ordenSeleccionada}
          onClose={() => setMostrarModalPago(false)}
          onPagoRegistrado={(nuevaOrden) => {
            setOrdenSeleccionada(nuevaOrden);
            cargarOrdenes();
          }}
          tasas={tasas}
          monedaPrincipal={monedaPrincipal}
        />
      )}
    </div>
  );
}
