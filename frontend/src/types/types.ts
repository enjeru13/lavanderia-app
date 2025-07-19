export type Moneda = "USD" | "VES" | "COP";
export type TipoCliente = "NATURAL" | "EMPRESA";
export type EstadoOrden = "PENDIENTE" | "ENTREGADO";
export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "PAGO_MOVIL";
export type EstadoPagoRaw = "COMPLETO" | "INCOMPLETO";
export type EstadoPagoTexto = "Sin pagos" | "Parcial" | "Pagado";
export type EstadoPagoDisplay = EstadoPagoRaw | EstadoPagoTexto;

// Cliente
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

// DTO para la creación de un Cliente (definición manual)
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

// DTO para la actualización parcial de un Cliente (definición manual)
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

// Servicio
export interface Servicio {
  id: number;
  nombreServicio: string;
  descripcion: string | null;
  precioBase: number;
  permiteDecimales: boolean;
  detalleOrdenes?: DetalleOrden[];
}

// DTO para la creación de un Servicio (definición manual)
export interface ServicioCreate {
  nombreServicio: string;
  descripcion?: string | null;
  precioBase: number;
  permiteDecimales?: boolean;
}

// DTO para la actualización parcial de un Servicio (definición manual)
export interface ServicioUpdatePayload {
  nombreServicio?: string;
  descripcion?: string | null;
  precioBase?: number;
  permiteDecimales?: boolean;
}

export type ServicioSeleccionado = {
  servicioId: number;
  cantidad: number;
};

// Detalle de Orden
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

// DTO para la creación de un Detalle de Orden (definición manual)
export interface DetalleOrdenCreate {
  ordenId: number;
  servicioId: number;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
}

// DTO para la actualización parcial de un Detalle de Orden (definición manual)
export interface DetalleOrdenUpdatePayload {
  ordenId?: number;
  servicioId?: number;
  cantidad?: number;
  precioUnit?: number;
  subtotal?: number;
}

// DTO para la creación de una Orden (definición manual)
export interface OrdenCreate {
  clienteId: number;
  estado: EstadoOrden;
  observaciones?: string | null;
  fechaEntrega?: string | null;
  servicios: ServicioSeleccionado[];
}

// DTO para la actualización parcial de una Orden (definición manual)
export interface OrdenUpdatePayload {
  clienteId?: number;
  estado?: EstadoOrden;
  observaciones?: string | null;
  fechaEntrega?: string | null;
  servicios?: ServicioSeleccionado[];
}

// Orden (representa la orden completa tal como la devuelve el backend)
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

// DTO para la creación de un Pago (definición manual)
export interface PagoCreate {
  ordenId: number;
  monto: number;
  moneda: Moneda;
  metodoPago: MetodoPago;
  nota?: string | null;
  vueltos?: VueltoEntregadoCreate[];
}

// DTO para la actualización parcial de un Pago (definición manual)
export interface PagoUpdatePayload {
  ordenId?: number;
  monto?: number;
  moneda?: Moneda;
  metodoPago?: MetodoPago;
  nota?: string | null;
  vueltos?: VueltoEntregadoCreate[];
}

// VueltoEntregado (Coincide con el modelo de Prisma)
export interface VueltoEntregado {
  id: number;
  pagoId: number;
  monto: number;
  moneda: string;
  pago?: Pago;
}

// DTO para la creación de un VueltoEntregado (definición manual)
export interface VueltoEntregadoCreate {
  monto: number;
  moneda: Moneda;
}

// Configuracion (Coincide con el modelo de Prisma)
export interface Configuracion {
  id: number;
  nombreNegocio: string | null;
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

// DTO para la creación de una Configuración (definición manual)
export interface ConfiguracionCreate {
  nombreNegocio: string | null;
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

// DTO para la actualización parcial de una Configuración (definición manual)
export interface ConfiguracionUpdatePayload {
  nombreNegocio?: string | null;
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
