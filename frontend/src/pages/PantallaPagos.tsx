import { useEffect, useState, useMemo } from "react";
import { FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  formatearMoneda,
  convertirAmonedaPrincipal,
  normalizarMoneda,
  type Moneda,
  type TasasConversion,
} from "../utils/monedaHelpers";
import { pagosService } from "../services/pagosService";
import type { Pago, MetodoPago, Orden } from "../../../shared/types/types";
import ModalDetalleOrden from "../components/modal/ModalDetalleOrden";
import { configuracionService } from "../services/configuracionService";
import { ordenesService } from "../services/ordenesService";

interface PagoConOrden extends Pago {
  orden?: Orden & { cliente?: { nombre: string; apellido: string } };
}

const metodoPagoDisplay: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  PAGO_MOVIL: "Pago móvil",
};

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

  const cargarPagos = async () => {
    try {
      const res = await pagosService.getAll();
      setPagos(res.data || []);
    } catch (err) {
      console.error("Error al cargar pagos:", err);
      toast.error("Error al cargar el historial de pagos.");
    } finally {
      setLoading(false);
    }
  };

  const cargarConfiguracion = async () => {
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
  };

  useEffect(() => {
    cargarPagos();
    cargarConfiguracion();
  }, []);

  const handleSort = (column: SortKeys) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: SortKeys) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  const pagosFiltradosYSorteadas = useMemo(() => {
    const pagosFiltrados = pagos.filter((pago) => {
      const terminoBusqueda = filtroBusqueda.trim().toLowerCase();

      const matchOrdenId = String(pago.ordenId).includes(terminoBusqueda);

      const nombreCliente = `${pago.orden?.cliente?.nombre ?? ""} ${
        pago.orden?.cliente?.apellido ?? ""
      }`.toLowerCase();
      const matchCliente = nombreCliente.includes(terminoBusqueda);

      const pagoFecha = new Date(pago.fechaPago);
      let matchFecha = true;
      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        matchFecha = pagoFecha >= inicio;
      }
      if (fechaFin && matchFecha) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        matchFecha = pagoFecha <= fin;
      }

      return (matchOrdenId || matchCliente) && matchFecha;
    });

    const totalIngresosFiltrados = pagosFiltrados.reduce((sum, pago) => {
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

    const pagosProcesados = [...pagosFiltrados];

    if (sortColumn) {
      pagosProcesados.sort((a, b) => {
        let valA: number;
        let valB: number;

        if (sortColumn === "fechaPago") {
          valA = new Date(a.fechaPago).getTime();
          valB = new Date(b.fechaPago).getTime();
        } else if (sortColumn === "ordenId") {
          valA = a.ordenId;
          valB = b.ordenId;
        } else if (sortColumn === "monto") {
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
        } else {
          valA = 0;
          valB = 0;
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return { pagos: pagosProcesados, totalIngresos: totalIngresosFiltrados };
  }, [
    pagos,
    filtroBusqueda,
    fechaInicio,
    fechaFin,
    sortColumn,
    sortDirection,
    tasas,
    monedaPrincipal,
  ]);

  const { pagos: pagosParaMostrar, totalIngresos } = pagosFiltradosYSorteadas;

  const handleVerDetallesOrden = async (ordenId: number) => {
    setCargandoOrdenDetalle(true);
    try {
      const res = await ordenesService.getById(ordenId);
      const ordenCompleta = res.data;

      if (ordenCompleta) {
        setOrdenSeleccionada(ordenCompleta);
      } else {
        toast.error("No se pudo cargar la información completa de la orden.");
      }
    } catch (error) {
      console.error("Error al cargar detalles de la orden:", error);
      toast.error("Error al cargar los detalles de la orden.");
    } finally {
      setCargandoOrdenDetalle(false);
    }
  };

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
      </div>

      <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 mb-6 flex justify-between items-center">
        <span className="text-blue-800 font-semibold text-lg">
          Total de Ingresos :
        </span>
        <span className="text-blue-900 font-bold text-2xl">
          {formatearMoneda(totalIngresos, monedaPrincipal)}
        </span>
      </div>

      {loading || cargandoOrdenDetalle ? (
        <p className="text-gray-500">Cargando pagos...</p>
      ) : pagosParaMostrar.length === 0 ? (
        <p className="text-gray-500">
          No se encontraron pagos registrados con los filtros aplicados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
              <tr className="text-left">
                <th
                  className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("fechaPago")}
                >
                  <div className="flex items-center gap-1">
                    Fecha {getSortIcon("fechaPago")}
                  </div>
                </th>
                <th
                  className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("ordenId")}
                >
                  <div className="flex items-center gap-1">
                    Orden {getSortIcon("ordenId")}
                  </div>
                </th>
                <th className="px-4 py-2 font-semibold">Cliente</th>
                <th className="px-4 py-2 font-semibold whitespace-nowrap">
                  Método
                </th>
                <th className="px-4 py-2 font-semibold whitespace-nowrap">
                  Moneda
                </th>
                <th
                  className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("monto")}
                >
                  <div className="flex items-center gap-1">
                    Monto abonado {getSortIcon("monto")}
                  </div>
                </th>
                <th className="px-4 py-2 font-semibold text-center whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {pagosParaMostrar.map((pago) => {
                const monedaSegura: Moneda = pago.moneda;
                return (
                  <tr
                    key={pago.id}
                    className="border-t border-gray-100 hover:bg-blue-50 transition-colors duration-150 text-gray-700 font-semibold"
                  >
                    {" "}
                    {/* Ajustado para coincidir con TablaOrdenes */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(pago.fechaPago).toLocaleDateString("es-VE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">
                      #{pago.ordenId}
                    </td>
                    <td className="px-4 py-3">
                      {pago.orden?.cliente?.nombre}{" "}
                      {pago.orden?.cliente?.apellido}
                    </td>
                    <td className="px-4 py-3 capitalize whitespace-nowrap">
                      {metodoPagoDisplay[pago.metodoPago]}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {monedaSegura}
                    </td>
                    <td className="px-4 py-3 text-green-700 font-semibold whitespace-nowrap">
                      {formatearMoneda(pago.monto, monedaSegura)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleVerDetallesOrden(pago.ordenId)}
                        title="Ver detalles de la orden"
                        className="p-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                        disabled={cargandoOrdenDetalle}
                      >
                        <FaSearch size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {ordenSeleccionada && (
        <ModalDetalleOrden
          orden={ordenSeleccionada}
          tasas={tasas}
          monedaPrincipal={monedaPrincipal}
          onClose={() => setOrdenSeleccionada(null)}
          onPagoRegistrado={() => cargarPagos()}
          onAbrirPagoExtra={() => {}}
        />
      )}
    </div>
  );
}
