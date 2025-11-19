import { useEffect, useState, useMemo, useCallback } from "react";
import { FaPrint, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import dayjs from "dayjs";

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

import type { Pago, Orden, Configuracion } from "@lavanderia/shared/types/types";

interface PagoConOrden extends Pago {
  orden?: Orden & { cliente?: { nombre: string; apellido: string } };
  tasa?: number | null; // Aseguramos el tipo para la tasa histórica
}

type SortKeys = "fechaPago" | "ordenId" | "monto";
type SortDirection = "asc" | "desc";

export default function PantallaPagos() {
  const [pagos, setPagos] = useState<PagoConOrden[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [configNegocio, setConfigNegocio] = useState<Configuracion | null>(null);
  
  // --- FILTROS DE TIEMPO (SOLO MES Y AÑO) ---
  const [mesSeleccionado, setMesSeleccionado] = useState(dayjs().month());
  const [anioSeleccionado, setAnioSeleccionado] = useState(dayjs().year());

  const [sortColumn, setSortColumn] = useState<SortKeys | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(null);
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
      setConfigNegocio(config);
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

  // Resetea la página si cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroBusqueda, mesSeleccionado, anioSeleccionado]);

  const handleSort = (column: SortKeys) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const pagosFiltradosYSorteadas = useMemo(() => {
    // 1. FILTRADO
    const pagosFiltrados = pagos.filter((pago) => {
      const termino = filtroBusqueda.trim().toLowerCase();
      
      // Lógica de búsqueda por texto
      const matchOrdenId = String(pago.ordenId).includes(termino);
      const nombreCliente = `${pago.orden?.cliente?.nombre ?? ""} ${
        pago.orden?.cliente?.apellido ?? ""
      }`.toLowerCase();
      const matchCliente = nombreCliente.includes(termino);

      // Lógica de fecha (Mes y Año exactos)
      const fechaPago = dayjs(pago.fechaPago);
      const coincideMes = fechaPago.month() === mesSeleccionado;
      const coincideAnio = fechaPago.year() === anioSeleccionado;

      return (matchOrdenId || matchCliente) && coincideMes && coincideAnio;
    });

    const pagosProcesados = [...pagosFiltrados];

    // 2. ORDENAMIENTO (Con Tasa Histórica)
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
          // Ordenar por monto real usando snapshot histórico
          const tasaEfectivaA =
            a.tasa && a.tasa > 0
              ? a.tasa
              : tasas[a.moneda as keyof TasasConversion];
          const tasasSnapshotA = { ...tasas, [a.moneda]: tasaEfectivaA };

          const tasaEfectivaB =
            b.tasa && b.tasa > 0
              ? b.tasa
              : tasas[b.moneda as keyof TasasConversion];
          const tasasSnapshotB = { ...tasas, [b.moneda]: tasaEfectivaB };

          valA = convertirAmonedaPrincipal(
            a.monto,
            a.moneda,
            tasasSnapshotA,
            monedaPrincipal
          );
          valB = convertirAmonedaPrincipal(
            b.monto,
            b.moneda,
            tasasSnapshotB,
            monedaPrincipal
          );
        }

        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }

    // 3. CÁLCULO TOTAL INGRESOS (Con Tasa Histórica)
    const totalIngresos = pagosFiltrados.reduce((sum, pago) => {
      const tasaHistorica =
        pago.tasa && pago.tasa > 0
          ? pago.tasa
          : tasas[pago.moneda as keyof TasasConversion];

      const tasasSnapshot = {
        ...tasas,
        [pago.moneda]: tasaHistorica,
      };

      return (
        sum +
        convertirAmonedaPrincipal(
          pago.monto,
          pago.moneda,
          tasasSnapshot,
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
    sortColumn,
    currentPage,
    itemsPerPage,
    filtroBusqueda,
    mesSeleccionado,  // Dependencia clave
    anioSeleccionado, // Dependencia clave
    sortDirection,
    tasas,
    monedaPrincipal,
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
        {/* BUSCADOR */}
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

        {/* SELECTOR DE MES */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Mes</label>
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm bg-white cursor-pointer"
          >
            <option value={0}>Enero</option>
            <option value={1}>Febrero</option>
            <option value={2}>Marzo</option>
            <option value={3}>Abril</option>
            <option value={4}>Mayo</option>
            <option value={5}>Junio</option>
            <option value={6}>Julio</option>
            <option value={7}>Agosto</option>
            <option value={8}>Septiembre</option>
            <option value={9}>Octubre</option>
            <option value={10}>Noviembre</option>
            <option value={11}>Diciembre</option>
          </select>
        </div>

        {/* SELECTOR DE AÑO */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Año</label>
          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm bg-white cursor-pointer"
          >
            {/* Rango de años. Puedes ajustar esto dinámicamente si prefieres */}
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* BOTÓN IMPRIMIR */}
        <div className="flex flex-col mt-5">
          <button
            onClick={() => setMostrarModalImprimir(true)}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-600 transition duration-200 ease-in-out transform hover:scale-105 flex items-center gap-2 font-bold text-sm shadow-md"
          >
            <FaPrint size={16} /> Imprimir reporte
          </button>
        </div>
      </div>

      {/* BANNER TOTAL INGRESOS */}
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 mb-6 flex justify-between items-center">
        <span className="text-blue-800 font-semibold text-lg">
          Total Ingresos ({dayjs().month(mesSeleccionado).format("MMMM")}):
        </span>
        <span className="text-blue-900 font-bold text-2xl">
          {formatearMoneda(totalIngresos, monedaPrincipal)}
        </span>
      </div>

      {/* TABLA */}
      {loading || cargandoOrdenDetalle ? (
        <p className="text-gray-500">Cargando pagos...</p>
      ) : pagosParaMostrar.length === 0 && totalFilteredItems === 0 ? (
        <p className="text-gray-500">
          No se encontraron pagos en este mes.
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
        configuracion={configNegocio}
      />
    </div>
  );
}