import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Componentes panel
import ClientePanel from "../components/panel/ClientePanel";
import ServiciosPanel from "../components/panel/ServiciosPanel";
import ObservacionesPanel from "../components/panel/ObservacionesPanel";
import FechaEntregaPanel from "../components/panel/FechaEntregaPanel";
import ResumenOrdenPanel from "../components/panel/ResumenOrdenPanel";
import ConfirmarOrdenPanel from "../components/panel/ConfirmarOrdenPanel";

// Modales y Formularios
import FormularioCliente from "../components/formulario/FormularioCliente";
import ListaClientesModal from "../components/modal/ListaClientesModal";

// Services
import { servicioService } from "../services/serviciosService";
import { clientesService } from "../services/clientesService";
import { ordenesService } from "../services/ordenesService";
import { configuracionService } from "../services/configuracionService";

import type {
  Cliente,
  ClienteCreate,
  Servicio,
  ServicioSeleccionado,
  OrdenCreate,
  Moneda,
  TasasConversion,
} from "../../../shared/types/types";
import { normalizarMoneda } from "../utils/monedaHelpers";

export default function PantallaPrincipal() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [mostrarFormularioCliente, setMostrarFormularioCliente] =
    useState(false);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const [serviciosCatalogo, setServiciosCatalogo] = useState<Servicio[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<
    ServicioSeleccionado[]
  >([]);
  const [observaciones, setObservaciones] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [monedaPrincipal, setMonedaPrincipal] = useState<Moneda>("USD");
  const [tasas, setTasas] = useState<TasasConversion>({});
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        const resServicios = await servicioService.getAll();
        setServiciosCatalogo(resServicios.data);

        const resConfig = await configuracionService.get();
        const config = resConfig.data;
        setMonedaPrincipal(normalizarMoneda(config.monedaPrincipal ?? "USD"));
        setTasas({
          VES: config.tasaVES ?? null,
          COP: config.tasaCOP ?? null,
        });
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        toast.error("Error al cargar datos iniciales del sistema.");
      } finally {
        setLoading(false);
      }
    }
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const isValid = cliente !== null && serviciosSeleccionados.length > 0;
    setIsFormValid(isValid);
  }, [cliente, serviciosSeleccionados]);

  const crearOrden = async () => {
    if (!cliente) {
      toast.error("Debes seleccionar un cliente para crear la orden.");
      return;
    }

    if (serviciosSeleccionados.length === 0) {
      toast.error("Debes seleccionar al menos un servicio.");
      return;
    }

    setIsSaving(true);

    const nuevaOrden: OrdenCreate = {
      clienteId: cliente.id,
      estado: "PENDIENTE",
      observaciones: observaciones.trim() || null,
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega).toISOString() : null,
      servicios: serviciosSeleccionados,
    };

    try {
      await ordenesService.create(nuevaOrden);
      toast.success("Orden creada exitosamente!");
      setCliente(null);
      setServiciosSeleccionados([]);
      setObservaciones("");
      setFechaEntrega("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error al crear la orden:", error);
      toast.error("Error al crear la orden.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelarOrden = () => {
    setCliente(null);
    setServiciosSeleccionados([]);
    setObservaciones("");
    setFechaEntrega("");
    toast.info("Creación de orden cancelada.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calcularTotal = () =>
    serviciosSeleccionados.reduce((total, item) => {
      const servicio = serviciosCatalogo.find((s) => s.id === item.servicioId);
      return total + (servicio?.precioBase ?? 0) * item.cantidad;
    }, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-600">
        Cargando datos del sistema...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nueva Orden</h1>

      <ClientePanel
        cliente={cliente}
        onAbrirFormulario={() => setMostrarFormularioCliente(true)}
        onAbrirLista={() => setMostrarListaClientes(true)}
      />

      <ServiciosPanel
        serviciosCatalogo={serviciosCatalogo}
        serviciosSeleccionados={serviciosSeleccionados}
        setServiciosSeleccionados={setServiciosSeleccionados}
        monedaPrincipal={monedaPrincipal}
      />

      <ObservacionesPanel
        observaciones={observaciones}
        setObservaciones={setObservaciones}
      />

      <FechaEntregaPanel
        fechaEntrega={fechaEntrega}
        setFechaEntrega={setFechaEntrega}
      />

      <ResumenOrdenPanel
        cliente={cliente}
        serviciosSeleccionados={serviciosSeleccionados}
        serviciosCatalogo={serviciosCatalogo}
        observaciones={observaciones}
        fechaEntrega={fechaEntrega}
        monedaPrincipal={monedaPrincipal}
      />

      <ConfirmarOrdenPanel
        total={calcularTotal()}
        onRegistrar={crearOrden}
        onCancelar={cancelarOrden}
        tasas={tasas}
        monedaPrincipal={monedaPrincipal}
        isFormValid={isFormValid}
        isSaving={isSaving}
      />

      {mostrarFormularioCliente && (
        <FormularioCliente
          onClose={() => setMostrarFormularioCliente(false)}
          onSubmit={async (data) => {
            try {
              const res = await clientesService.create(data as ClienteCreate);
              setCliente(res.data);
              toast.success("Cliente registrado correctamente");
            } catch (error) {
              console.error("Error al registrar cliente:", error);
              toast.error("Error al registrar cliente");
            }
            setMostrarFormularioCliente(false);
          }}
        />
      )}

      {mostrarListaClientes && (
        <ListaClientesModal
          onClose={() => setMostrarListaClientes(false)}
          onSelect={(c: Cliente) => {
            setCliente(c);
            setMostrarListaClientes(false);
          }}
        />
      )}
    </div>
  );
}
