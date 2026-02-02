import { Orden } from "@lavanderia/shared/types/types";
import {
  TasasConversion,
  formatearMoneda,
  convertirDesdePrincipal,
} from "./monedaHelpers";

/**
 * @param orden
 * @param nombreNegocio
 * @param tasas
 * @returns
 */
export const generarEnlaceWhatsApp = (
  orden: Orden,
  nombreNegocio: string,
  tasas?: TasasConversion,
): string | null => {
  const cliente = orden.cliente;
  if (!cliente || !cliente.telefono) return null;

  const telefonoLimpio = cliente.telefono.replace(/\D/g, "");

  if (telefonoLimpio.length < 10) return null;

  const nombreCliente = `${cliente.nombre} ${cliente.apellido}`.trim();

  let cuentaPendiente =
    orden.faltante > 0 ? formatearMoneda(orden.faltante, "USD") : "Pagada";

  if (orden.faltante > 0 && tasas) {
    const montosExtra: string[] = [];

    if (tasas.VES && tasas.VES > 0) {
      const montosVES = convertirDesdePrincipal(orden.faltante, "VES", tasas);
      montosExtra.push(formatearMoneda(montosVES, "VES"));
    }

    if (tasas.COP && tasas.COP > 0) {
      const montosCOP = convertirDesdePrincipal(orden.faltante, "COP", tasas);
      montosExtra.push(formatearMoneda(montosCOP, "COP"));
    }

    if (montosExtra.length > 0) {
      cuentaPendiente += ` (${montosExtra.join(" / ")})`;
    }
  }

  const mensaje = `Hola ${nombreCliente} 👋

Te escribimos de la ${nombreNegocio} para informarte que tu orden #${orden.id} ya está lista para retirar ✅.

Cuenta pendiente: ${cuentaPendiente}

¡Te esperamos!
Gracias por tu preferencia.`;

  return `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
};
