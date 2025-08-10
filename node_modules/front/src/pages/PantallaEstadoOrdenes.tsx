import { useEffect, useState, useMemo, useCallback } from "react";
import { FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  normalizarMoneda,
  type Moneda,
  type TasasConversion,
} from "../utils/monedaHelpers";
import { ordenesService } from "../services/ordenesService";
import { configuracionService } from "../services/configuracionService";
import { calcularResumenPago } from "../../../shared/utils/pagoFinance";
import { badgeEstado, badgePago } from "../utils/badgeHelpers";
import ModalDetalleOrden from "../components/modal/ModalDetalleOrden";
import ModalPago from "../components/modal/ModalPago";
import ControlesPaginacion from "../components/ControlesPaginacion";
import type {
  Orden,
  SortDirection,
  EstadoOrden,
  EstadoPagoRaw,
} from "../../../shared/types/types";
import { useAuth } from "../hooks/useAuth";

type SortKeys = "id" | "cliente" | "estado" | "estadoPago";

export default function PantallaEstadoOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [sortColumn, setSortColumn] = useState<SortKeys | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(
    null
  );
  const [tasas, setTasas] = useState<TasasConversion>({});
  const [monedaPrincipal, setMonedaPrincipal] = useState<Moneda>("USD");
  const [cargandoOrdenDetalle, setCargandoOrdenDetalle] = useState(false);
  const [filtroEstadoEntrega, setFiltroEstadoEntrega] = useState<
    EstadoOrden | "" | "TODOS"
  >("TODOS");
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<
    EstadoPagoRaw | "" | "TODOS"
  >("TODOS");
  const [mostrarModalPago, setMostrarModalPago] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);

  const { hasRole } = useAuth();

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

  const cargarOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordenesService.getAll();
      const ordenesConEstadoPago = res.data.map((orden: Orden) => {
        const resumen = calcularResumenPago(orden, tasas, monedaPrincipal);
        return { ...orden, ...resumen };
      });
      setOrdenes(ordenesConEstadoPago);
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
      toast.error("Error al cargar el historial de órdenes.");
    } finally {
      setLoading(false);
    }
  }, [tasas, monedaPrincipal]);

  useEffect(() => {
    cargarConfiguracion().then(() => {
      cargarOrdenes();
    });
  }, [cargarConfiguracion, cargarOrdenes]);

  useEffect(() => {
    if (Object.keys(tasas).length > 0 && monedaPrincipal) {
      cargarOrdenes();
    }
  }, [tasas, monedaPrincipal, cargarOrdenes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, filtroEstadoEntrega, filtroEstadoPago]);

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

  const ordenesFiltradasYSorteadas = useMemo(() => {
    let ordenesProcesadas = [...ordenes];

    if (busqueda.trim() !== "") {
      const terminoBusqueda = busqueda.trim().toLowerCase();
      ordenesProcesadas = ordenesProcesadas.filter((o) => {
        const matchId = String(o.id).includes(terminoBusqueda);
        const nombreCliente = `${o.cliente?.nombre ?? ""} ${
          o.cliente?.apellido ?? ""
        }`.toLowerCase();
        const matchCliente = nombreCliente.includes(terminoBusqueda);
        return matchId || matchCliente;
      });
    }

    if (filtroEstadoEntrega !== "" && filtroEstadoEntrega !== "TODOS") {
      ordenesProcesadas = ordenesProcesadas.filter(
        (o) => o.estado === filtroEstadoEntrega
      );
    }

    if (filtroEstadoPago !== "" && filtroEstadoPago !== "TODOS") {
      ordenesProcesadas = ordenesProcesadas.filter(
        (o) => o.estadoPago === filtroEstadoPago
      );
    }

    if (sortColumn) {
      ordenesProcesadas.sort((a, b) => {
        let valA: number | string;
        let valB: number | string;

        if (sortColumn === "id") {
          valA = a.id;
          valB = b.id;
        } else if (sortColumn === "cliente") {
          valA = `${a.cliente?.nombre ?? ""} ${
            a.cliente?.apellido ?? ""
          }`.toLowerCase();
          valB = `${b.cliente?.nombre ?? ""} ${
            b.cliente?.apellido ?? ""
          }`.toLowerCase();
        } else if (sortColumn === "estado") {
          valA = a.estado;
          valB = b.estado;
        } else if (sortColumn === "estadoPago") {
          valA = a.estadoPago;
          valB = b.estadoPago;
        } else {
          valA = "";
          valB = "";
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    setTotalFilteredItems(ordenesProcesadas.length);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return ordenesProcesadas.slice(startIndex, endIndex);
  }, [
    ordenes,
    busqueda,
    sortColumn,
    sortDirection,
    filtroEstadoEntrega,
    filtroEstadoPago,
    currentPage,
    itemsPerPage,
  ]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalFilteredItems / itemsPerPage);
  }, [totalFilteredItems, itemsPerPage]);

  const handleVerDetallesOrden = async (ordenId: number) => {
    setCargandoOrdenDetalle(true);
    try {
      const res = await ordenesService.getById(ordenId);
      const ordenCompleta = res.data;

      if (ordenCompleta) {
        const resumen = calcularResumenPago(
          ordenCompleta,
          tasas,
          monedaPrincipal
        );
        setOrdenSeleccionada({ ...ordenCompleta, ...resumen });
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
      const resumenActualizado = calcularResumenPago(
        actualizada,
        tasas,
        monedaPrincipal
      );
      const ordenParaActualizarEstado = {
        ...actualizada,
        ...resumenActualizado,
      };

      setOrdenes((prevOrdenes) => {
        const index = prevOrdenes.findIndex(
          (o) => o.id === ordenParaActualizarEstado.id
        );
        if (index > -1) {
          const newOrdenes = [...prevOrdenes];
          newOrdenes[index] = ordenParaActualizarEstado;
          return newOrdenes;
        }
        return prevOrdenes;
      });

      setMostrarModalPago(false);
      setOrdenSeleccionada(null);
      toast.success("Orden actualizada con el nuevo pago.");
    },
    [tasas, monedaPrincipal]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">
        Estado de las Órdenes
      </h1>

      <div className="mb-5 flex flex-wrap items-center gap-4 font-semibold">
        <div className="flex flex-col">
          <label
            htmlFor="filtroBusquedaOrdenes"
            className="text-xs text-gray-500 mb-1"
          >
            Buscar por N° de Orden o Cliente
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

        <div className="flex flex-col">
          <label
            htmlFor="filtroEstadoEntrega"
            className="text-xs text-gray-500 mb-1"
          >
            Estado de Entrega
          </label>
          <select
            id="filtroEstadoEntrega"
            value={filtroEstadoEntrega}
            onChange={(e) =>
              setFiltroEstadoEntrega(e.target.value as EstadoOrden | "TODOS")
            }
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
          >
            <option value="TODOS">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="filtroEstadoPago"
            className="text-xs text-gray-500 mb-1"
          >
            Estado de Pago
          </label>
          <select
            id="filtroEstadoPago"
            value={filtroEstadoPago}
            onChange={(e) =>
              setFiltroEstadoPago(e.target.value as EstadoPagoRaw | "TODOS")
            }
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
          >
            <option value="TODOS">Todos</option>
            <option value="COMPLETO">Completo</option>
            <option value="INCOMPLETO">Incompleto</option>
          </select>
        </div>
      </div>

      {loading || cargandoOrdenDetalle ? (
        <p className="text-gray-500">Cargando órdenes...</p>
      ) : ordenesFiltradasYSorteadas.length === 0 &&
        totalFilteredItems === 0 ? (
        <p className="text-gray-500">
          No se encontraron órdenes con los filtros aplicados.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 mb-4">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                <tr className="text-left">
                  <th
                    className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center gap-1">
                      Orden {getSortIcon("id")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("cliente")}
                  >
                    <div className="flex items-center gap-1">
                      Cliente {getSortIcon("cliente")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("estado")}
                  >
                    <div className="flex items-center gap-1">
                      Estado de Entrega {getSortIcon("estado")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 font-semibold cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("estadoPago")}
                  >
                    <div className="flex items-center gap-1">
                      Estado de Pago {getSortIcon("estadoPago")}
                    </div>
                  </th>
                  <th className="px-4 py-2 text-center whitespace-nowrap">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradasYSorteadas.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-gray-100 hover:bg-blue-50 transition-colors duration-150 text-gray-700 font-semibold"
                  >
                    <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">
                      #{o.id}
                    </td>
                    <td className="px-4 py-3">
                      {o.cliente?.nombre} {o.cliente?.apellido}
                    </td>
                    <td className="px-4 py-3">{badgeEstado(o.estado)}</td>
                    <td className="px-4 py-3">{badgePago(o.estadoPago)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleVerDetallesOrden(o.id)}
                        title="Ver detalles de la orden"
                        className="p-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                      >
                        <FaSearch size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
    </div>
  );
}
