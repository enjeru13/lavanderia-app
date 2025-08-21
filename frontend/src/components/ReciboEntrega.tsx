import { forwardRef } from "react";
import {
  formatearMoneda,
  type Moneda,
} from "../../../shared/src/utils/monedaHelpers";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

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

    const formatDate = (date: string | Date | undefined | null) => {
      if (!date) return "";
      const fecha = dayjs(date);
      return fecha.isValid() ? fecha.format("DD/MM/YYYY") : "";
    };

    const formatAlignedLine = (labelText: string, value: string | number) => {
      const valueText = String(value);
      return (
        <div className="flex justify-between w-full">
          <span className="font-bold">{labelText}</span>
          <span>{valueText}</span>
        </div>
      );
    };

    return (
      <div
        className="w-full max-w-[80mm] mx-auto p-3 font-mono text-sm text-gray-900 leading-tight"
        ref={ref}
      >
        {/* Encabezado */}
        <div className="text-center mb-3">
          <h2 className="text-lg font-extrabold mb-1">
            {lavanderiaInfo.nombre}
          </h2>{" "}
          {/* Simula 2X */}
          {lavanderiaInfo.rif && (
            <p className="text-xs">{`RIF: ${lavanderiaInfo.rif}`}</p>
          )}
          {lavanderiaInfo.direccion && (
            <p className="text-xs">{lavanderiaInfo.direccion}</p>
          )}
          {lavanderiaInfo.telefonoPrincipal && (
            <p className="text-xs">{`Whatsapp: ${lavanderiaInfo.telefonoPrincipal}`}</p>
          )}
          {lavanderiaInfo.telefonoSecundario && (
            <p className="text-xs">{`CANTV: ${lavanderiaInfo.telefonoSecundario}`}</p>
          )}
          {numeroOrden && (
            <p className="font-bold text-sm mt-2">N° Orden: #{numeroOrden}</p>
          )}
        </div>
        <hr className="border-t border-dashed border-gray-400 my-2" />

        {/* Datos del cliente */}
        <div className="text-left mb-2 text-sm">
          <p className="my-0.5">
            <span className="font-bold">Cliente:</span> {clienteInfo.nombre}{" "}
            {clienteInfo.apellido}
          </p>
          <p className="my-0.5">
            <span className="font-bold">CI/RIF:</span>{" "}
            {clienteInfo.identificacion}
          </p>
          <p className="my-0.5">
            <span className="font-bold">Fecha ingreso:</span>{" "}
            {formatDate(clienteInfo.fechaIngreso)}
          </p>
          {clienteInfo.fechaEntrega && (
            <p className="my-0.5">
              <span className="font-bold">Fecha entrega:</span>{" "}
              {formatDate(clienteInfo.fechaEntrega)}
            </p>
          )}
        </div>
        <hr className="border-t border-dashed border-gray-400 my-2" />

        {/* Encabezado de Ítems */}
        <div className="flex justify-between font-bold text-sm mb-1">
          <span className="w-1/2">ITEM</span>
          <span className="w-1/4 text-center">CANT</span>
          <span className="w-1/4 text-right">TOTAL</span>
        </div>
        <hr className="border-t border-dashed border-gray-400 my-2" />

        {/* Lista de Ítems */}
        <div className="items-list text-sm">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between my-0.5">
              <span className="w-1/2 pr-1 truncate">{item.descripcion}</span>
              <span className="w-1/4 text-center">{item.cantidad}</span>
              <span className="w-1/4 text-right">
                {formatearMoneda(
                  item.cantidad * item.precioUnitario,
                  monedaPrincipal
                )}
              </span>
            </div>
          ))}
        </div>

        <hr className="border-t border-dashed border-gray-400 my-2" />

        {/* Totales */}
        <div className="totales text-sm">
          {formatAlignedLine(
            "Total Cantidad Piezas:",
            items.reduce((sum, item) => sum + item.cantidad, 0)
          )}
          {formatAlignedLine("Total:", formatearMoneda(total, monedaPrincipal))}
          {formatAlignedLine(
            "Total Abono:",
            formatearMoneda(abono, monedaPrincipal)
          )}
          {formatAlignedLine(
            "Por pagar:",
            formatearMoneda(restante, monedaPrincipal)
          )}
        </div>

        <hr className="border-t border-dashed border-gray-400 my-2" />

        {/* Observaciones */}
        {observaciones && (
          <div className="observaciones text-sm">
            <p className="font-bold my-0.5">Observaciones:</p>
            <p className="my-0.5">{observaciones}</p>
            <hr className="border-t border-dashed border-gray-400 my-2" />
          </div>
        )}

        {/* Pie */}
        <div className="footer text-center text-xs mt-4">
          <p className="my-0.5">¡Gracias por preferirnos!</p>
          <p className="my-0.5">
            {mensajePieRecibo ??
              "* Este comprobante no da derecho a reclamo sin ticket"}
          </p>
          <p className="font-bold my-0.5">(NO DA DERECHO A CRÉDITO FISCAL)</p>
        </div>
        <div className="h-8"></div>
      </div>
    );
  }
);

export default ReciboEntrega;
