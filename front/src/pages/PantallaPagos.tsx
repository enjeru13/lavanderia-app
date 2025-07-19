import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { formatearMoneda } from "../utils/monedaHelpers";
import { pagosService } from "../services/pagosService";
import type { Pago, Moneda, MetodoPago } from "../types/types";

const metodoPagoDisplay: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  PAGO_MOVIL: "Pago móvil",
};

export default function PantallaPagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function fetchPagos() {
      try {
        const res = await pagosService.getAll();
        setPagos(res.data || []);
      } catch (err) {
        console.error("Error al cargar pagos:", err);
        toast.error("Error al cargar el historial de pagos."); // ✅ Usar toast
      } finally {
        setLoading(false);
      }
    }
    fetchPagos();
  }, []);

  const pagosFiltrados = pagos.filter((pago) =>
    String(pago.ordenId).includes(filtro.trim())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">
        Historial de pagos
      </h1>

      <div className="mb-5 flex items-center gap-3">
        <div className="relative w-72">
          <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por número de orden"
            className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando pagos...</p>
      ) : pagosFiltrados.length === 0 ? (
        <p className="text-gray-500">No se encontraron pagos registrados.</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow-sm border bg-white">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600">
              <tr className="text-left">
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Orden</th>
                <th className="px-5 py-3 font-medium">Método</th>
                <th className="px-5 py-3 font-medium">Moneda</th>
                <th className="px-5 py-3 font-medium">Monto abonado</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((pago) => {
                const monedaSegura: Moneda = pago.moneda;
                return (
                  <tr key={pago.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3">
                      {new Date(pago.fechaPago).toLocaleDateString("es-VE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 font-semibold text-blue-600">
                      #{pago.ordenId}
                    </td>
                    <td className="px-5 py-3 capitalize">
                      {metodoPagoDisplay[pago.metodoPago]}
                    </td>
                    <td className="px-5 py-3 font-medium">{monedaSegura}</td>
                    <td className="px-5 py-3 text-green-700 font-semibold">
                      {formatearMoneda(pago.monto, monedaSegura)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
