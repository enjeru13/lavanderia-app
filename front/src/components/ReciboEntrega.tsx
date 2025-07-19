import { forwardRef } from "react";
import { formatearMoneda, type Moneda } from "../utils/monedaHelpers";
import "../components/styles/recibo.css";

interface ReciboItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

interface ReciboClienteInfo {
  nombre: string;
  apellido: string;
  identificacion: string;
  fechaIngreso: string | Date;
  fechaEntrega?: string | Date | null;
}

interface ReciboLavanderiaInfo {
  nombre: string;
  rif: string | null;
  direccion: string | null;
  telefonoPrincipal: string | null;
  telefonoSecundario: string | null;
}

interface ReciboProps {
  clienteInfo: ReciboClienteInfo;
  items: ReciboItem[];
  abono: number;
  total: number;
  lavanderiaInfo: ReciboLavanderiaInfo;
  numeroOrden?: number;
  observaciones?: string | null;
  mensajePieRecibo?: string | null;
  monedaPrincipal: Moneda;
}

const ReciboEntrega = forwardRef<HTMLDivElement, ReciboProps>(
  (
    {
      clienteInfo,
      items,
      abono,
      total,
      lavanderiaInfo,
      numeroOrden,
      observaciones,
      mensajePieRecibo,
      monedaPrincipal,
    },
    ref
  ) => {
    const restante = Math.max(total - abono, 0);

    // Función para formatear fechas de manera consistente
    const formatDate = (date: string | Date | undefined | null) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString();
    };

    return (
      <div className="recibo" ref={ref}>
        {/* Encabezado */}
        <div className="encabezado">
          <h2>{lavanderiaInfo.nombre}</h2>
          {lavanderiaInfo.rif && <p>RIF: {lavanderiaInfo.rif}</p>}
          {lavanderiaInfo.direccion && <p>{lavanderiaInfo.direccion}</p>}
          {lavanderiaInfo.telefonoPrincipal && (
            <p>Tlf: {lavanderiaInfo.telefonoPrincipal}</p>
          )}
          {!lavanderiaInfo.telefonoPrincipal &&
            lavanderiaInfo.telefonoSecundario && (
              <p>Tlf: {lavanderiaInfo.telefonoSecundario}</p>
            )}
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
            <strong>Cliente:</strong> {clienteInfo.nombre}{" "}
            {clienteInfo.apellido}
          </p>
          <p>
            <strong>CI/RIF:</strong> {clienteInfo.identificacion}
          </p>
          <p>
            <strong>Fecha ingreso:</strong>{" "}
            {formatDate(clienteInfo.fechaIngreso)}
          </p>
          {clienteInfo.fechaEntrega && (
            <p>
              <strong>Fecha entrega:</strong>{" "}
              {formatDate(clienteInfo.fechaEntrega)}
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
                {item.cantidad} x{" "}
                {formatearMoneda(item.precioUnitario, monedaPrincipal)}{" "}
              </span>
              <span>
                ={" "}
                {formatearMoneda(
                  item.cantidad * item.precioUnitario,
                  monedaPrincipal
                )}{" "}
              </span>
            </div>
          ))}
        </div>

        <hr />

        {/* Totales */}
        <div className="totales">
          <p>Subtotal: {formatearMoneda(total, monedaPrincipal)}</p>{" "}
          <p>Abono: {formatearMoneda(abono, monedaPrincipal)}</p>{" "}
          <p>
            <strong>Por pagar:</strong>{" "}
            {formatearMoneda(restante, monedaPrincipal)}{" "}
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
