import { forwardRef } from "react";
import { formatearMoneda } from "../utils/monedaHelpers";
import "../components/styles/recibo.css";

type Item = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
};

type Cliente = {
  nombre: string;
  identificacion: string;
  fechaIngreso: string | Date;
  fechaEntrega?: string | Date;
};

type Lavanderia = {
  nombre: string;
  rif: string;
  direccion: string;
  telefono: string;
};

type Props = {
  cliente: Cliente;
  items: Item[];
  abono: number;
  total: number;
  lavanderia: Lavanderia;
  numeroOrden?: number;
  observaciones?: string;
  mostrarRecibidoPor?: boolean;
  recibidoPor?: string;
  mensajePieRecibo?: string;
};

const ReciboEntrega = forwardRef<HTMLDivElement, Props>(
  (
    {
      cliente,
      items,
      abono,
      total,
      lavanderia,
      numeroOrden,
      observaciones,
      mensajePieRecibo,
    },
    ref
  ) => {
    const restante = Math.max(Number(total) - Number(abono), 0);

    const formatDate = (date: string | Date | undefined) =>
      date ? new Date(date).toLocaleDateString() : "";

    return (
      <div className="recibo" ref={ref}>
        {/* Encabezado */}
        <div className="encabezado">
          <h2>{lavanderia.nombre}</h2>
          <p>RIF: {lavanderia.rif}</p>
          <p>{lavanderia.direccion}</p>
          <p>Tlf: {lavanderia.telefono}</p>
          {numeroOrden && (
            <p>
              <strong>N° Orden:</strong> #{numeroOrden}
            </p>
          )}
          <hr />
        </div>

        {/* Datos del cliente */}
        <div className="datos-cliente">
          <p>
            <strong>Cliente:</strong> {cliente.nombre}
          </p>
          <p>
            <strong>CI/RIF:</strong> {cliente.identificacion}
          </p>
          <p>
            <strong>Fecha ingreso:</strong> {formatDate(cliente.fechaIngreso)}
          </p>
          {cliente.fechaEntrega && (
            <p>
              <strong>Fecha entrega:</strong> {formatDate(cliente.fechaEntrega)}
            </p>
          )}
          <hr />
        </div>

        {/* Ítems */}
        <div className="items">
          {items.map((item, idx) => (
            <div key={idx} className="item-linea">
              <span>{item.descripcion}</span>
              <span>
                {item.cantidad} x {formatearMoneda(item.precioUnitario, "USD")}
              </span>
              <span>
                = {formatearMoneda(item.cantidad * item.precioUnitario, "USD")}
              </span>
            </div>
          ))}
        </div>

        <hr />

        {/* Totales */}
        <div className="totales">
          <p>Subtotal: {formatearMoneda(total, "USD")}</p>
          <p>Abono: {formatearMoneda(abono, "USD")}</p>
          <p>
            <strong>Por pagar:</strong> {formatearMoneda(restante, "USD")}
          </p>
        </div>

        {/* Observaciones */}
        {observaciones && (
          <div className="observaciones">
            <hr />
            <p>
              <strong>Observaciones:</strong>
            </p>
            <p>{observaciones}</p>
          </div>
        )}

        {/* Pie */}
        <div className="footer">
          <hr />
          <p>
            {mensajePieRecibo ??
              "* Este comprobante no da derecho a reclamo sin ticket"}
          </p>
        </div>
      </div>
    );
  }
);

export default ReciboEntrega;
