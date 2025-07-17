/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalPago from "../components/modal/ModalPago";
import TablaOrdenes from "../components/tabla/TablaOrdenes";
import ModalDetalleOrden from "../components/modal/ModalDetalleOrden";
import { FaSearch } from "react-icons/fa";

export default function PantallaOrdenes() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [tasas, setTasas] = useState<{ VES?: number; COP?: number }>({});
  const [monedaPrincipal, setMonedaPrincipal] = useState("USD");

  const convertirAUSD = (monto: number, moneda: string): number => {
    if (moneda === "USD") return monto;
    if (moneda === "VES") return monto / (tasas.VES || 1);
    if (moneda === "COP") return monto / (tasas.COP || 1);
    return monto;
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
    const nombre = `${o.cliente?.nombre || ""} ${
      o.cliente?.apellido || ""
    }`.toLowerCase();
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

  const actualizarOrdenEnLista = (actualizada: any) => {
    const abonado =
      actualizada.pagos?.reduce(
        (sum: number, p: any) => sum + convertirAUSD(p.monto, p.moneda),
        0
      ) || 0;

    const faltante = Math.max(actualizada.total - abonado, 0);
    const estadoPago = faltante <= 0 ? "COMPLETO" : "PENDIENTE";

    const enriquecida = { ...actualizada, abonado, faltante, estadoPago };

    setOrdenes((prev) =>
      prev.map((o) => (o.id === actualizada.id ? enriquecida : o))
    );
    setOrdenSeleccionada(enriquecida);
  };

  return (
    <div className="p-6 font-semibold space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Historial de Órdenes</h1>

      <div className="mb-5 flex items-center gap-3">
        <div className="relative w-72">
          <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente número de orden"
            className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
          />
        </div>
      </div>

      <TablaOrdenes
        ordenes={ordenesFiltradas}
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
        <ModalDetalleOrden
          orden={ordenSeleccionada}
          tasas={tasas}
          monedaPrincipal={monedaPrincipal}
          onClose={() => setOrdenSeleccionada(null)}
          onPagoRegistrado={actualizarOrdenEnLista}
          onAbrirPagoExtra={(orden) => {
            setOrdenSeleccionada(orden);
            setMostrarModalPago(true);
          }}
        />
      )}

      {mostrarModalPago && ordenSeleccionada && (
        <ModalPago
          orden={ordenSeleccionada}
          tasas={tasas}
          monedaPrincipal={monedaPrincipal}
          onClose={() => setMostrarModalPago(false)}
          onPagoRegistrado={(actualizada) => {
            actualizarOrdenEnLista(actualizada);
            setMostrarModalPago(false);
          }}
        />
      )}
    </div>
  );
}
