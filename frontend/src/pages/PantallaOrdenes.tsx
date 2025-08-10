/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import ModalPago from "../components/modal/ModalPago";
import TablaOrdenes from "../components/tabla/TablaOrdenes";
import ModalDetalleOrden from "../components/modal/ModalDetalleOrden";
import ConfirmacionModal from "../components/modal/ConfirmacionModal";
import { FaSearch } from "react-icons/fa";
import { calcularResumenPago } from "@lavanderia/shared/utils/pagoFinance";
import {
  normalizarMoneda,
  type Moneda,
  type TasasConversion,
} from "../utils/monedaHelpers";
import { ordenesService } from "../services/ordenesService";
import { configuracionService } from "../services/configuracionService";
import { useAuth } from "../hooks/useAuth";
import type { Orden } from "@lavanderia/shared/types/types";
import ControlesPaginacion from "../components/ControlesPaginacion";

export default function PantallaOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(
    null
  );
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [tasas, setTasas] = useState<TasasConversion>({});
  const [monedaPrincipal, setMonedaPrincipal] = useState<Moneda>("USD");
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] =
    useState(false);
  const [ordenAEliminarId, setOrdenAEliminarId] = useState<
    number | undefined
  >();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);

  const { hasRole } = useAuth();

  const cargarOrdenes = useCallback(async () => {
    try {
      const res = await ordenesService.getAll();
      const ordenesEnriquecidas = res.data.map((orden: Orden) => {
        const resumen = calcularResumenPago(orden, tasas, monedaPrincipal);
        return { ...orden, ...resumen };
      });
      setOrdenes(ordenesEnriquecidas);
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
      toast.error("Error al cargar órdenes");
    }
  }, [tasas, monedaPrincipal]);

  const cargarConfiguracion = useCallback(async () => {
    try {
      const res = await configuracionService.get();
      const config = res.data;
      const newMonedaPrincipal = normalizarMoneda(
        config.monedaPrincipal ?? "USD"
      );
      const newTasas = {
        VES: config.tasaVES ?? null,
        COP: config.tasaCOP ?? null,
      };

      setMonedaPrincipal((prevMoneda) => {
        if (prevMoneda !== newMonedaPrincipal) {
          return newMonedaPrincipal;
        }
        return prevMoneda;
      });

      setTasas((prevTasas) => {
        if (prevTasas.VES !== newTasas.VES || prevTasas.COP !== newTasas.COP) {
          return newTasas;
        }
        return prevTasas;
      });
    } catch (err) {
      console.error("Error al cargar configuración:", err);
      toast.error("Error al cargar configuración");
    }
  }, []);

  useEffect(() => {
    cargarConfiguracion().then(() => {
      cargarOrdenes();
    });
  }, [cargarConfiguracion, cargarOrdenes]);

  useEffect(() => {
    if (Object.keys(tasas).length > 0 && monedaPrincipal) {
      cargarOrdenes();
    }
  }, [tasas, monedaPrincipal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  const ordenesFiltradasYPaginadas = useMemo(() => {
    const ordenesProcesadas = ordenes.filter((o) => {
      const nombre = `${o.cliente?.nombre ?? ""} ${
        o.cliente?.apellido ?? ""
      }`.toLowerCase();
      const id = o.id.toString();
      const termino = busqueda.toLowerCase();
      return nombre.includes(termino) || id.includes(termino);
    });

    setTotalFilteredItems(ordenesProcesadas.length);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return ordenesProcesadas.slice(startIndex, endIndex);
  }, [ordenes, busqueda, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalFilteredItems / itemsPerPage);
  }, [totalFilteredItems, itemsPerPage]);

  const confirmarEliminarOrden = useCallback(
    (id: number) => {
      if (hasRole(["ADMIN"])) {
        setOrdenAEliminarId(id);
        setMostrarConfirmacionEliminar(true);
      } else {
        toast.error("No tienes permiso para eliminar órdenes.");
      }
    },
    [hasRole]
  );

  const ejecutarEliminarOrden = useCallback(async () => {
    if (ordenAEliminarId === undefined) return;

    try {
      await ordenesService.delete(ordenAEliminarId);
      toast.success("Orden eliminada correctamente");
      cargarOrdenes();
    } catch (err) {
      toast.error("Error al eliminar la orden");
      console.error(err);
    } finally {
      setMostrarConfirmacionEliminar(false);
      setOrdenAEliminarId(undefined);
    }
  }, [ordenAEliminarId, cargarOrdenes]);

  const marcarComoEntregada = useCallback(
    async (id: number) => {
      if (!hasRole(["ADMIN", "EMPLOYEE"])) {
        toast.error("No tienes permiso para marcar órdenes como entregadas.");
        return;
      }

      try {
        const ordenActual = ordenes.find((o) => o.id === id);
        if (!ordenActual) {
          toast.error("Orden no encontrada para marcar como entregada.");
          return;
        }

        const payload: Partial<Orden> = {
          estado: "ENTREGADO",
        };

        const res = await ordenesService.update(id, payload);
        toast.success("Orden marcada como entregada");
        actualizarOrdenEnLista(res.data);
      } catch (err) {
        toast.error("Error al actualizar estado");
        console.error(err);
      }
    },
    [ordenes, hasRole]
  );

  const actualizarOrdenEnLista = useCallback(
    (actualizada: Orden) => {
      const resumen = calcularResumenPago(actualizada, tasas, monedaPrincipal);
      const enriquecida: Orden = { ...actualizada, ...resumen };

      setOrdenes((prev) =>
        prev.map((o) => (o.id === enriquecida.id ? enriquecida : o))
      );
      setOrdenSeleccionada(enriquecida);
    },
    [tasas, monedaPrincipal]
  );

  const handleAbrirPagoExtra = useCallback(
    (orden: Orden) => {
      if (hasRole(["ADMIN", "EMPLOYEE"])) {
        setOrdenSeleccionada(orden);
        setMostrarModalPago(true);
      } else {
        toast.error("No tienes permiso para registrar pagos adicionales.");
      }
    },
    [hasRole]
  );

  const handlePagoRegistrado = useCallback(
    (actualizada: Orden) => {
      actualizarOrdenEnLista(actualizada);
      setMostrarModalPago(false);
      setOrdenSeleccionada(null);
    },
    [actualizarOrdenEnLista]
  );

  return (
    <div className="p-6 font-semibold space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Historial de Órdenes
        </h1>
      </div>

      <div className="mb-5 flex items-center gap-3 font-semibold">
        <div className="flex flex-col">
          <label
            htmlFor="filtroBusquedaOrdenes"
            className="text-xs text-gray-500 mb-1"
          >
            Buscar por Nombre o por N° de Orden
          </label>
          <div className="relative w-72">
            <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
            <input
              type="text"
              id="filtroBusquedaOrdenes"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Orden o cliente"
              className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
            />
          </div>
        </div>
      </div>

      {ordenesFiltradasYPaginadas.length === 0 && totalFilteredItems > 0 ? (
        <p className="text-gray-500">
          No se encontraron órdenes en esta página con los filtros aplicados.
        </p>
      ) : ordenesFiltradasYPaginadas.length === 0 &&
        totalFilteredItems === 0 ? (
        <p className="text-gray-500">
          No se encontraron órdenes con los filtros aplicados.
        </p>
      ) : (
        <>
          <TablaOrdenes
            ordenes={ordenesFiltradasYPaginadas}
            monedaPrincipal={monedaPrincipal}
            onVerDetalles={setOrdenSeleccionada}
            onRegistrarPago={handleAbrirPagoExtra}
            onMarcarEntregada={marcarComoEntregada}
            onEliminar={confirmarEliminarOrden}
          />
          {totalPages > 1 && (
            <ControlesPaginacion
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {ordenSeleccionada && (
        <ModalDetalleOrden
          orden={ordenSeleccionada}
          tasas={tasas}
          monedaPrincipal={monedaPrincipal}
          onClose={() => setOrdenSeleccionada(null)}
          onPagoRegistrado={actualizarOrdenEnLista}
          onAbrirPagoExtra={handleAbrirPagoExtra}
        />
      )}

      {mostrarModalPago && ordenSeleccionada && (
        <ModalPago
          orden={ordenSeleccionada}
          tasas={tasas}
          monedaPrincipal={monedaPrincipal}
          onClose={() => setMostrarModalPago(false)}
          onPagoRegistrado={handlePagoRegistrado}
        />
      )}

      {mostrarConfirmacionEliminar && (
        <ConfirmacionModal
          mensaje={`¿Estás segura de que deseas eliminar la orden #${ordenAEliminarId}? Esta acción no se puede deshacer.`}
          onConfirm={ejecutarEliminarOrden}
          onCancel={() => {
            setMostrarConfirmacionEliminar(false);
            setOrdenAEliminarId(undefined);
          }}
        />
      )}
    </div>
  );
}
