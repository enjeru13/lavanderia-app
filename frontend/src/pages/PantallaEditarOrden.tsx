import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

// Componentes panel (REUTILIZAMOS LOS MISMOS QUE YA TIENES)
import ClientePanel from "../components/panel/ClientePanel";
import ServiciosPanel from "../components/panel/ServiciosPanel";
import ObservacionesPanel from "../components/panel/ObservacionesPanel";
import FechaEntregaPanel from "../components/panel/FechaEntregaPanel";
import ResumenOrdenPanel from "../components/panel/ResumenOrdenPanel";
import ConfirmarOrdenPanel from "../components/panel/ConfirmarOrdenPanel";

// Services
import { servicioService } from "../services/serviciosService";
import { ordenesService } from "../services/ordenesService";
import { configuracionService } from "../services/configuracionService";

import type {
  Cliente,
  Servicio,
  ServicioSeleccionado,
  Moneda,
  TasasConversion,
} from "@lavanderia/shared/types/types";
import { normalizarMoneda } from "../utils/monedaHelpers";
import dayjs from "dayjs";

export default function EditarOrdenPage() {
  const { id } = useParams(); // ID DE LA ORDEN A EDITAR
  const navigate = useNavigate();

  // Estados idénticos a la pantalla de crear
  const [cliente, setCliente] = useState<Cliente | null>(null);
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

  // 1. CARGAR CONFIGURACIÓN (Igual que siempre)
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
        toast.error("Error al cargar datos iniciales.");
      }
    }
    cargarDatosIniciales();
  }, []);

  // 2. LOGICA ÚNICA DE ESTA PÁGINA: CARGAR LA ORDEN EXISTENTE
  useEffect(() => {
    async function cargarOrdenExistente() {
      if (!id) return;

      try {
        setLoading(true);
        const res = await ordenesService.getById(Number(id));
        const orden = res.data;

        // Rellenamos los estados con la data que viene del backend
        setCliente(orden.cliente || null);
        setObservaciones(orden.observaciones || "");

        if (orden.fechaEntrega) {
          setFechaEntrega(dayjs(orden.fechaEntrega).format("YYYY-MM-DD"));
        }

        // Convertimos los detalles de la BD al formato que usa el panel
        if (orden.detalles) {
          const serviciosMapeados: ServicioSeleccionado[] = orden.detalles.map(
            (detalle) => ({
              servicioId: detalle.servicio?.id || 0,
              cantidad: detalle.cantidad,
              // Si tuvieras descuentos guardados en el detalle, irían aquí
            })
          );
          setServiciosSeleccionados(serviciosMapeados);
        }
      } catch (error) {
        console.error("Error al cargar la orden:", error);
        toast.error("No se pudo cargar la orden.");
        navigate("/ordenes");
      } finally {
        setLoading(false);
      }
    }

    // Ejecutamos carga cuando tenemos el ID
    cargarOrdenExistente();
  }, [id, navigate]);

  // Validación
  useEffect(() => {
    const isValid = cliente !== null && serviciosSeleccionados.length > 0;
    setIsFormValid(isValid);
  }, [cliente, serviciosSeleccionados]);

  // Cálculos para el panel de confirmar
  const calcularTotal = () => {
    return serviciosSeleccionados.reduce((total, item) => {
      const servicio = serviciosCatalogo.find((s) => s.id === item.servicioId);
      return total + (servicio?.precioBase ?? 0) * item.cantidad;
    }, 0);
  };

  // 3. LOGICA ÚNICA: ACTUALIZAR EN VEZ DE CREAR
  const guardarCambios = async () => {
    if (!cliente || serviciosSeleccionados.length === 0) return;

    setIsSaving(true);

    const payload = {
      observaciones: observaciones.trim() || null,
      fechaEntrega: fechaEntrega ? dayjs(fechaEntrega).toISOString() : null,
      servicios: serviciosSeleccionados, // Enviamos la lista nueva
    };

    try {
      await ordenesService.update(Number(id), payload);
      toast.success(`Orden #${id} actualizada exitosamente.`);
      navigate("/ordenes"); // Volvemos al historial
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error("Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 font-medium text-lg">
        Cargando orden para editar...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Editar Orden <span className="text-blue-600">#{id}</span>
        </h1>
        <button
          onClick={() => navigate("/ordenes")}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Cancelar edición
        </button>
      </div>

      {/* Reutilizamos tus componentes existentes */}
      <ClientePanel
        cliente={cliente}
        onAbrirFormulario={() => {}}
        onAbrirLista={() =>
          toast.info("Para cambiar el cliente, crea una orden nueva.")
        }
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
        subtotal={calcularTotal()}
        descuentoTotal={0}
        onRegistrar={guardarCambios} // Llamamos a actualizar
        onCancelar={() => navigate("/ordenes")}
        tasas={tasas}
        monedaPrincipal={monedaPrincipal}
        isFormValid={isFormValid}
        isSaving={isSaving}
      />
    </div>
  );
}
