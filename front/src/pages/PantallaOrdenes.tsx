/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function PantallaOrdenes() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [pagoMonto, setPagoMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState("");
  const [monedaSeleccionada, setMonedaSeleccionada] = useState("");

  const metodoMap: Record<string, string> = {
    Efectivo: "EFECTIVO",
    Transferencia: "TRANSFERENCIA",
    "Pago móvil": "PAGO_MOVIL",
  };

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

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const ordenesFiltradas = ordenes.filter((o) => {
    const cliente = `${o.cliente?.nombre || ""} ${
      o.cliente?.apellido || ""
    }`.toLowerCase();
    return cliente.includes(busqueda.toLowerCase());
  });

  const badgeEstado = (estado: string) => {
    const map: Record<string, string> = {
      PENDIENTE: "bg-yellow-100 text-yellow-800",
      PAGADO: "bg-green-100 text-green-800",
      ENTREGADO: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
          map[estado] || "bg-gray-100 text-gray-700"
        }`}
      >
        {estado}
      </span>
    );
  };

  const badgePago = (estadoPago: string) => {
    const map: Record<string, string> = {
      "Sin pagos": "bg-red-100 text-red-700",
      Parcial: "bg-yellow-100 text-yellow-800",
      Pagado: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
          map[estadoPago] || "bg-gray-100 text-gray-700"
        }`}
      >
        {estadoPago}
      </span>
    );
  };

  const estadoPago = (orden: any) => {
    const totalAbonado =
      orden.pagos?.reduce((sum: number, p: any) => sum + p.monto, 0) || 0;
    if (totalAbonado === 0) return "Sin pagos";
    if (totalAbonado >= orden.total) return "Pagado";
    return "Parcial";
  };

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
        placeholder="Buscar por cliente"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="px-3 py-2 border rounded w-1/2"
      />

      <table className="w-full bg-white shadow rounded table-auto">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Cliente</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Pago</th>
            <th className="px-4 py-2 text-left">Ingreso</th>
            <th className="px-4 py-2 text-left">Entrega</th>
            <th className="px-4 py-2 text-left">Total</th>
            <th className="px-4 py-2 text-left">Observaciones</th>
            <th className="px-4 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenesFiltradas.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="px-4 py-2">
                {o.cliente?.nombre} {o.cliente?.apellido}
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Entrega:</span>
                    {o.estado === "ENTREGADO"
                      ? badgeEstado("ENTREGADO")
                      : badgeEstado("PENDIENTE")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Pago:</span>
                    {badgePago(estadoPago(o))}
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="space-y-0.5">
                  <div>{estadoPago(o)}</div>
                  <div className="text-xs text-gray-500">
                    Abonado: $
                    {(
                      o.pagos?.reduce(
                        (sum: number, p: any) => sum + p.monto,
                        0
                      ) || 0
                    ).toFixed(2)}
                  </div>
                  <div className="text-xs text-red-600">
                    Falta: $
                    {Math.max(
                      o.total -
                        (o.pagos?.reduce(
                          (sum: number, p: any) => sum + p.monto,
                          0
                        ) || 0),
                      0
                    ).toFixed(2)}
                  </div>
                </div>
              </td>
              <td className="px-4 py-2">
                {new Date(o.fechaIngreso).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                {o.fechaEntrega
                  ? new Date(o.fechaEntrega).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-4 py-2 font-semibold">${o.total.toFixed(2)}</td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {o.observaciones || "—"}
              </td>
              <td className="px-4 py-2 text-right align-top">
                <div className="grid grid-cols-1 gap-2">
                  {/* Ver detalles */}
                  <button
                    onClick={() => setOrdenSeleccionada(o)}
                    className={`bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center justify-center gap-1 ${
                      o.estado === "ENTREGADO" && estadoPago(o) !== "Pagado"
                        ? "w-full"
                        : ""
                    }`}
                  >
                    Ver detalles
                  </button>

                  {/* Registrar pago */}
                  {estadoPago(o) !== "Pagado" && o.estado !== "ENTREGADO" && (
                    <button
                      onClick={() => {
                        setOrdenSeleccionada(o);
                        setMostrarModalPago(true);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 flex items-center justify-center gap-1"
                    >
                      Registrar pago
                    </button>
                  )}

                  {/* Marcar entregada */}
                  {o.estado !== "ENTREGADO" && (
                    <button
                      onClick={() => marcarComoEntregada(o.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      Marcar entregada
                    </button>
                  )}

                  {/* Eliminar orden */}
                  <button
                    onClick={() => eliminarOrden(o.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center justify-center gap-1"
                  >
                    Eliminar orden
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modales */}
      {ordenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full overflow-auto max-h-[90vh] space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🧾 Detalle de la Orden
            </h2>

            {/* 🧍 Cliente + Estado */}
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
                    ({estadoPago(ordenSeleccionada)})
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

            {/* 📦 Servicios */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Servicios</h3>
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600 text-left">
                    <tr>
                      <th className="px-3 py-2">Servicio</th>
                      <th className="px-3 py-2">Cantidad</th>
                      <th className="px-3 py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenSeleccionada.detalles?.map(
                      (d: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">
                            {d.servicio?.nombreServicio}
                          </td>
                          <td className="px-3 py-2">{d.cantidad}</td>
                          <td className="px-3 py-2">
                            ${d.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 💸 Pagos realizados */}
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

            {/* 💰 Total */}
            <div className="text-right text-lg font-semibold text-green-700">
              Total: ${ordenSeleccionada.total.toFixed(2)}
            </div>

            {/* ✅ Acciones */}
            <div className="text-right flex gap-2 justify-end pt-4">
              {estadoPago(ordenSeleccionada) !== "Pagado" && (
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-6">
            <h2 className="text-lg font-bold text-gray-800">
              💸 Registrar nuevo pago
            </h2>

            <div className="space-y-4">
              {/* 💵 Monto */}
              <label className="block text-sm text-gray-700">
                Monto abonado:
                <input
                  type="number"
                  value={pagoMonto}
                  onChange={(e) => setPagoMonto(Number(e.target.value))}
                  className="mt-1 w-full border px-3 py-2 rounded"
                  min={0}
                  placeholder="Ej. 10.00"
                />
              </label>

              {/* 💳 Método de pago */}
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

              {/* 🪙 Moneda */}
              <label className="block text-sm text-gray-700">
                Moneda:
                <select
                  value={monedaSeleccionada}
                  onChange={(e) => setMonedaSeleccionada(e.target.value)}
                  className="mt-1 w-full border px-3 py-2 rounded"
                >
                  <option value="">Seleccionar moneda</option>
                  <option value="USD">Dólares (USD)</option>
                  <option value="VES">Bolívares (VES)</option>
                  <option value="COP">Pesos Colombianos (COP)</option>
                </select>
              </label>
            </div>

            {/* 🎯 Botones */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setMostrarModalPago(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  if (!pagoMonto || !metodoPago || !monedaSeleccionada) {
                    toast.error("Completa todos los campos");
                    return;
                  }
                  try {
                    await axios.post("/api/pagos", {
                      ordenId: ordenSeleccionada.id,
                      monto: pagoMonto,
                      metodoPago: metodoMap[metodoPago],
                      moneda: monedaSeleccionada, // ✅ Se envía al backend
                    });
                    toast.success("Pago registrado exitosamente");
                    setMostrarModalPago(false);
                    setPagoMonto(0);
                    setMetodoPago("");
                    setMonedaSeleccionada("");
                    const actualizadas = await axios.get("/api/ordenes");
                    setOrdenes(actualizadas.data);
                    const nuevaOrden = actualizadas.data.find(
                      (o: { id: any }) => o.id === ordenSeleccionada.id
                    );
                    setOrdenSeleccionada(nuevaOrden);
                  } catch (err) {
                    toast.error("Error al registrar el pago");
                    console.error("Pago error:", err);
                  }
                }}
                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
