import { useEffect, useState, useMemo, useCallback } from "react";
import { FaPrint, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import {
  formatearMoneda,
  convertirAmonedaPrincipal,
  normalizarMoneda,
  type Moneda,
  type TasasConversion,
} from "../utils/monedaHelpers";
import { pagosService } from "../services/pagosService";
import { configuracionService } from "../services/configuracionService";
import { ordenesService } from "../services/ordenesService";
import ControlesPaginacion from "../components/ControlesPaginacion";
import ModalDetalleOrden from "../components/modal/ModalDetalleOrden";
import TablaPagos from "../components/tabla/TablaPagos";
import ModalImprimirPagos from "../components/modal/ModalImprimirPagos";

import type { Pago, Orden } from "@lavanderia/shared/types/types";

interface PagoConOrden extends Pago {
  orden?: Orden & { cliente?: { nombre: string; apellido: string } };
}

type SortKeys = "fechaPago" | "ordenId" | "monto";
type SortDirection = "asc" | "desc";

export default function PantallaPagos() {
  const [pagos, setPagos] = useState<PagoConOrden[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [sortColumn, setSortColumn] = useState<SortKeys | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(
    null
  );
  const [tasas, setTasas] = useState<TasasConversion>({});
  const [monedaPrincipal, setMonedaPrincipal] = useState<Moneda>("USD");
  const [cargandoOrdenDetalle, setCargandoOrdenDetalle] = useState(false);
  const [mostrarModalImprimir, setMostrarModalImprimir] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  const cargarPagos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await pagosService.getAll();
      setPagos(res.data || []);
    } catch (err) {
      console.error("Error al cargar pagos:", err);
      toast.error("Error al cargar el historial de pagos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarConfiguracion = useCallback(async () => {
    try {
      const res = await configuracionService.get();
      const config = res.data;
      setMonedaPrincipal(normalizarMoneda(config.monedaPrincipal ?? "USD"));
      setTasas({
        VES: config.tasaVES ?? null,
        COP: config.tasaCOP ?? null,
      });
    } catch (err) {
      console.error("Error al cargar configuración:", err);
      toast.error("Error al cargar configuración");
    }
  }, []);

  useEffect(() => {
    cargarConfiguracion().then(cargarPagos);
  }, [cargarConfiguracion, cargarPagos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroBusqueda, fechaInicio, fechaFin]);

  const handleSort = (column: SortKeys) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const pagosFiltradosYSorteadas = useMemo(() => {
    const pagosFiltrados = pagos.filter((pago) => {
      const termino = filtroBusqueda.trim().toLowerCase();
      const matchOrdenId = String(pago.ordenId).includes(termino);
      const nombreCliente = `${pago.orden?.cliente?.nombre ?? ""} ${
        pago.orden?.cliente?.apellido ?? ""
      }`.toLowerCase();
      const matchCliente = nombreCliente.includes(termino);

      const pagoFecha = dayjs(pago.fechaPago);
      let matchFecha = true;

      if (fechaInicio) {
        const inicio = dayjs(fechaInicio).startOf("day");
        matchFecha = pagoFecha.isSameOrAfter(inicio);
      }
      if (fechaFin && matchFecha) {
        const fin = dayjs(fechaFin).endOf("day");
        matchFecha = pagoFecha.isSameOrBefore(fin);
      }

      return (matchOrdenId || matchCliente) && matchFecha;
    });

    const pagosProcesados = [...pagosFiltrados];

    if (sortColumn) {
      pagosProcesados.sort((a, b) => {
        let valA: number;
        let valB: number;

        if (sortColumn === "fechaPago") {
          valA = dayjs(a.fechaPago).valueOf();
          valB = dayjs(b.fechaPago).valueOf();
        } else if (sortColumn === "ordenId") {
          valA = a.ordenId;
          valB = b.ordenId;
        } else {
          valA = convertirAmonedaPrincipal(
            a.monto,
            a.moneda,
            tasas,
            monedaPrincipal
          );
          valB = convertirAmonedaPrincipal(
            b.monto,
            b.moneda,
            tasas,
            monedaPrincipal
          );
        }

        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }

    const totalIngresos = pagosFiltrados.reduce((sum, pago) => {
      return (
        sum +
        convertirAmonedaPrincipal(
          pago.monto,
          pago.moneda,
          tasas,
          monedaPrincipal
        )
      );
    }, 0);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = pagosProcesados.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return {
      pagos: paginated,
      pagosCompletos: pagosProcesados,
      totalIngresos,
      totalFilteredItems: pagosProcesados.length,
    };
  }, [
    pagos,
    filtroBusqueda,
    fechaInicio,
    fechaFin,
    sortColumn,
    sortDirection,
    tasas,
    monedaPrincipal,
    currentPage,
    itemsPerPage,
  ]);

  const {
    pagos: pagosParaMostrar,
    pagosCompletos,
    totalIngresos,
    totalFilteredItems,
  } = pagosFiltradosYSorteadas;

  const totalPages = useMemo(() => {
    return Math.ceil(totalFilteredItems / itemsPerPage);
  }, [totalFilteredItems, itemsPerPage]);

  const handleVerDetallesOrden = async (ordenId: number) => {
    setCargandoOrdenDetalle(true);
    try {
      const res = await ordenesService.getById(ordenId);
      setOrdenSeleccionada(res.data ?? null);
    } catch (error) {
      console.error("Error al cargar detalles de la orden:", error);
      toast.error("Error al cargar los detalles de la orden.");
    } finally {
      setCargandoOrdenDetalle(false);
    }
  };

  const handlePagoRegistrado = useCallback(() => {
    cargarPagos();
  }, [cargarPagos]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">
        Historial de pagos
      </h1>

      <div className="mb-5 flex flex-wrap items-center gap-4 font-semibold">
        <div className="flex flex-col">
          <label
            htmlFor="filtroBusqueda"
            className="text-xs text-gray-500 mb-1"
          >
            Buscar
          </label>
          <div className="relative w-72">
            <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
            <input
              type="text"
              id="filtroBusqueda"
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              placeholder="Orden o cliente"
              className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="fechaInicio" className="text-xs text-gray-500 mb-1">
            Desde
          </label>
          <input
            type="date"
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="fechaFin" className="text-xs text-gray-500 mb-1">
            Hasta
          </label>
          <input
            type="date"
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
          />
        </div>

        <div className="flex flex-col mt-5">
          <button
            onClick={() => setMostrarModalImprimir(true)}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-600 transition duration-200 ease-in-out transform hover:scale-105 flex items-center gap-2 font-bold text-sm shadow-md"
          >
            <FaPrint size={16} /> Imprimir historial
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 mb-6 flex justify-between items-center">
        <span className="text-blue-800 font-semibold text-lg">
          Total de Ingresos:
        </span>
        <span className="text-blue-900 font-bold text-2xl">
          {formatearMoneda(totalIngresos, monedaPrincipal)}
        </span>
      </div>

      {loading || cargandoOrdenDetalle ? (
        <p className="text-gray-500">Cargando pagos...</p>
      ) : pagosParaMostrar.length === 0 && totalFilteredItems === 0 ? (
        <p className="text-gray-500">
          No se encontraron pagos registrados con los filtros aplicados.
        </p>
      ) : (
        <>
          <TablaPagos
            pagos={pagosParaMostrar}
            monedaPrincipal={monedaPrincipal}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            cargandoOrdenDetalle={cargandoOrdenDetalle}
            onSort={handleSort}
            onVerDetallesOrden={handleVerDetallesOrden}
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
          onPagoRegistrado={handlePagoRegistrado}
          onAbrirPagoExtra={() => {}}
        />
      )}

      <ModalImprimirPagos
        visible={mostrarModalImprimir}
        onClose={() => setMostrarModalImprimir(false)}
        pagos={pagosCompletos}
        monedaPrincipal={monedaPrincipal}
        totalIngresos={totalIngresos}
      />
    </div>
  );
}
