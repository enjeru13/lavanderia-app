/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalPago from "../components/modal/ModalPago";
import TablaOrdenes from "../components/tabla/TablaOrdenes";
import ModalDetalleOrden from "../components/modal/ModalDetalleOrden";
import { FaSearch } from "react-icons/fa";
import { calcularResumenPago } from "../../../src/utils/pagoFinance";
import { normalizarMoneda, type Moneda } from "../utils/monedaHelpers";
import { ordenesService } from "../services/ordenesService";
import { configuracionService } from "../services/configuracionService";
import type { Orden } from "../types/types";

export default function PantallaOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(
    null
  );
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [tasas, setTasas] = useState<{ VES?: number; COP?: number }>({});
  const [monedaPrincipal, setMonedaPrincipal] = useState<Moneda>("USD");

  const cargarOrdenes = async () => {
    try {
      const res = await ordenesService.getAll();
      setOrdenes(res.data);
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
      toast.error("Error al cargar órdenes");
    }
  };

  const cargarConfiguracion = async () => {
    try {
      const res = await configuracionService.get();
      const config = res.data;
      setMonedaPrincipal(normalizarMoneda(config.monedaPrincipal ?? "USD"));
      setTasas({
        VES: config.tasaVES ?? undefined,
        COP: config.tasaCOP ? parseFloat(config.tasaCOP) : undefined,
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
    const nombre = `${o.cliente?.nombre ?? ""} ${
      o.cliente?.apellido ?? ""
    }`.toLowerCase();
    const id = o.id.toString();
    const termino = busqueda.toLowerCase();
    return nombre.includes(termino) || id.includes(termino);
  });

  const eliminarOrden = async (id: number) => {
    if (!confirm("¿Estás segura de que deseas eliminar esta orden?")) return;
    try {
      await ordenesService.delete(id);
      toast.success("Orden eliminada correctamente");
      cargarOrdenes();
    } catch (err) {
      toast.error("Error al eliminar la orden");
    }
  };

  const marcarComoEntregada = async (id: number) => {
    try {
      const ordenActual = ordenes.find((o) => o.id === id);
      const mismaFecha =
        ordenActual?.fechaEntrega === ordenActual?.fechaIngreso;

      const fechaEntrega =
        ordenActual?.fechaEntrega && !mismaFecha
          ? ordenActual.fechaEntrega
          : new Date().toISOString();

      const payload = {
        estado: "ENTREGADO",
        fechaEntrega,
      };

      const res = await ordenesService.update(id, payload);
      toast.success("Orden marcada como entregada");
      actualizarOrdenEnLista(res.data);
    } catch (err) {
      toast.error("Error al actualizar estado");
      console.error(err);
    }
  };

  const actualizarOrdenEnLista = (actualizada: Orden) => {
    const resumen = calcularResumenPago(actualizada, tasas, monedaPrincipal);
    const enriquecida: Orden = { ...actualizada, ...resumen };

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
            placeholder="Buscar por cliente o número de orden"
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
