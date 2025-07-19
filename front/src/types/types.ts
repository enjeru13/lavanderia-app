export type Moneda = "USD" | "VES" | "COP";
export type TipoCliente = "NATURAL" | "EMPRESA";
export type EstadoOrden = "PENDIENTE" | "ENTREGADO";
export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "PAGO_MOVIL";
export type EstadoPagoRaw = "COMPLETO" | "INCOMPLETO";
export type EstadoPagoTexto = "Sin pagos" | "Parcial" | "Pagado";

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  tipo: TipoCliente;
  telefono: string;
  telefono_secundario: string | null;
  direccion: string;
  identificacion: string;
  email: string | null;
  fechaRegistro: string;
  ordenes?: Orden[];
}

export interface ClienteCreate {
  nombre: string;
  apellido: string;
  tipo: TipoCliente;
  telefono: string;
  telefono_secundario?: string | null;
  direccion: string;
  identificacion: string;
  email?: string | null;
}

export interface ClienteUpdatePayload {
  nombre?: string;
  apellido?: string;
  tipo?: TipoCliente;
  telefono?: string;
  telefono_secundario?: string | null;
  direccion?: string;
  identificacion?: string;
  email?: string | null;
}

export interface ClienteResumen {
  id: number;
  nombre: string;
  apellido: string;
}

export interface Servicio {
  id: number;
  nombreServicio: string;
  descripcion: string | null;
  precioBase: number;
  detalleOrdenes?: DetalleOrden[];
}

export interface ServicioCreate {
  nombreServicio: string;
  descripcion?: string | null;
  precioBase: number;
}

export interface ServicioUpdatePayload {
  nombreServicio?: string;
  descripcion?: string | null;
  precioBase?: number;
}

export type ServicioSeleccionado = {
  servicioId: number;
  cantidad: number;
};

export interface DetalleOrden {
  id: number;
  ordenId: number;
  servicioId: number;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  orden?: Orden;
  servicio?: Servicio;
}

export interface DetalleOrdenCreate {
  ordenId: number;
  servicioId: number;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
}

export interface DetalleOrdenUpdatePayload {
  ordenId?: number;
  servicioId?: number;
  cantidad?: number;
  precioUnit?: number;
  subtotal?: number;
}

export interface OrdenCreate {
  clienteId: number;
  estado: EstadoOrden;
  observaciones?: string | null;
  fechaEntrega?: string | null;
  servicios: ServicioSeleccionado[];
}

export interface OrdenUpdatePayload {
  clienteId?: number;
  estado?: EstadoOrden;
  observaciones?: string | null;
  fechaEntrega?: string | null;
  servicios?: ServicioSeleccionado[];
}

export interface Orden {
  id: number;
  clienteId: number;
  estado: EstadoOrden;
  fechaIngreso: string;
  fechaEntrega: string | null;
  observaciones: string | null;
  total: number;
  abonado: number;
  faltante: number;
  estadoPago: EstadoPagoRaw;
  cliente?: Cliente;
  detalles?: DetalleOrden[];
  pagos?: Pago[];
}

// Pago
export interface Pago {
  id: number;
  ordenId: number;
  monto: number;
  moneda: Moneda;
  metodoPago: MetodoPago;
  nota: string | null;
  fechaPago: string;
  orden?: Orden;
  vueltos?: VueltoEntregado[];
}

export interface PagoCreate {
  ordenId: number;
  monto: number;
  moneda: Moneda;
  metodoPago: MetodoPago;
  nota?: string | null;
  vueltos?: VueltoEntregadoCreate[];
}

export interface PagoUpdatePayload {
  ordenId?: number;
  monto?: number;
  moneda?: Moneda;
  metodoPago?: MetodoPago;
  nota?: string | null;
  vueltos?: VueltoEntregadoCreate[];
}

export interface VueltoEntregado {
  id: number;
  pagoId: number;
  monto: number;
  moneda: string;
  pago?: Pago;
}

export interface VueltoEntregadoCreate {
  monto: number;
  moneda: Moneda;
}

export interface Configuracion {
  id: number;
  nombreNegocio: string;
  monedaPrincipal: Moneda;
  tasaUSD: number | null;
  tasaVES: number | null;
  tasaCOP: number | null;
  rif: string | null;
  direccion: string | null;
  telefonoPrincipal: string | null;
  telefonoSecundario: string | null;
  mensajePieRecibo: string | null;
}

export interface ConfiguracionCreate {
  nombreNegocio: string;
  monedaPrincipal: Moneda;
  tasaUSD?: number | null;
  tasaVES?: number | null;
  tasaCOP?: number | null;
  rif?: string | null;
  direccion?: string | null;
  telefonoPrincipal?: string | null;
  telefonoSecundario?: string | null;
  mensajePieRecibo?: string | null;
}

export interface ConfiguracionUpdatePayload {
  nombreNegocio?: string;
  monedaPrincipal?: Moneda;
  tasaUSD?: number | null;
  tasaVES?: number | null;
  tasaCOP?: number | null;
  rif?: string | null;
  direccion?: string | null;
  telefonoPrincipal?: string | null;
  telefonoSecundario?: string | null;
  mensajePieRecibo?: string | null;
}
