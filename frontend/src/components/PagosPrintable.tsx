import { forwardRef } from "react";
import { formatearMoneda } from "../utils/monedaHelpers";
import type {
  Moneda,
  Pago,
  Orden,
  MetodoPago,
} from "@lavanderia/shared/types/types";
import "./styles/pagos.css";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

interface PagoConOrden extends Pago {
  orden?: Orden & {
    cliente?: {
      nombre: string;
      apellido: string;
    };
  };
}

interface PagosPrintableProps {
  pagos: PagoConOrden[];
  monedaPrincipal: Moneda;
  totalIngresos: number;
}

const metodoPagoDisplay: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  PAGO_MOVIL: "Pago Móvil",
};

export const PagosPrintable = forwardRef<HTMLDivElement, PagosPrintableProps>(
  ({ pagos, monedaPrincipal, totalIngresos }, ref) => {
    const fechaGeneracion = dayjs().format("DD [de] MMMM [de] YYYY");

    return (
      <div ref={ref} className="print-container">
        <header className="reporte-header">
          <h1>Reporte de Historial de Pagos</h1>
          <p>**Fecha de Generación:** {fechaGeneracion}</p>
          <p>**Moneda Principal:** {monedaPrincipal}</p>
        </header>

        <table>
          <thead>
            <tr>
              <th>Fecha del Pago</th>
              <th>Nro. Orden</th>
              <th>Cliente</th>
              <th>Método de Pago</th>
              <th>Moneda</th>
              <th className="text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No se encontraron pagos para mostrar.
                </td>
              </tr>
            ) : (
              pagos.map((pago) => (
                <tr key={pago.id} className="avoid-break">
                  <td>{dayjs(pago.fechaPago).format("DD/MM/YYYY")}</td>

                  <td>#{pago.ordenId}</td>
                  <td>
                    {pago.orden?.cliente
                      ? `${pago.orden.cliente.nombre} ${pago.orden.cliente.apellido}`
                      : "N/A"}
                  </td>
                  <td>{metodoPagoDisplay[pago.metodoPago]}</td>
                  <td>{pago.moneda}</td>
                  <td className="text-right">
                    {formatearMoneda(pago.monto, pago.moneda)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="total">
          <span>Total de Ingresos:</span>
          <span className="total-amount">
            {formatearMoneda(totalIngresos, monedaPrincipal)}
          </span>
        </div>
      </div>
    );
  }
);
