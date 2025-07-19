import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Componentes panel
import ClientePanel from "../components/panel/ClientePanel";
import ServiciosPanel from "../components/panel/ServiciosPanel";
import ObservacionesPanel from "../components/panel/ObservacionesPanel";
import FechaEntregaPanel from "../components/panel/FechaEntregaPanel";
import FormularioCliente from "../components/formulario/FormularioCliente";
import ListaClientesModal from "../components/modal/ListaClientesModal";
import ResumenOrdenPanel from "../components/panel/ResumenOrdenPanel";
import ConfirmarOrdenPanel from "../components/panel/ConfirmarOrdenPanel";

// Services
import { servicioService } from "../services/serviciosService";
import { clientesService } from "../services/clientesService";
import { ordenesService } from "../services/ordenesService";

// Tipos
import type {
  Cliente,
  ClienteData,
  Servicio,
  ServicioSeleccionado,
  OrdenCreate,
} from "../types/types";

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

  useEffect(() => {
    servicioService
      .getAll()
      .then((res) => setServiciosCatalogo(res.data))
      .catch((err) => console.error("Error al cargar servicios:", err));
  }, []);

  const registrarOrden = async () => {
    if (!cliente || serviciosSeleccionados.length === 0) {
      toast.error(
        "Debes seleccionar al menos un servicio y asignar un cliente"
      );
      return;
    }

    const nuevaOrden: OrdenCreate = {
      cliente_id: cliente.id,
      estado: "PENDIENTE",
      observaciones,
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega).toISOString() : null,
      servicios: serviciosSeleccionados,
    };

    try {
      await ordenesService.create(nuevaOrden);
      toast.success("Orden registrada correctamente");

      setServiciosSeleccionados([]);
      setCliente(null);
      setObservaciones("");
      setFechaEntrega("");
    } catch (error) {
      console.error("Error al registrar orden:", error);
      toast.error("Hubo un error al guardar la orden");
    }
  };

  const calcularTotal = () =>
    serviciosSeleccionados.reduce((total, item) => {
      const servicio = serviciosCatalogo.find((s) => s.id === item.servicioId);
      return total + (servicio?.precioBase ?? 0) * item.cantidad;
    }, 0);

  return (
    <div className="p-6 space-y-6">
      <ClientePanel
        cliente={cliente}
        onAbrirFormulario={() => setMostrarFormularioCliente(true)}
        onAbrirLista={() => setMostrarListaClientes(true)}
      />

      <ServiciosPanel
        serviciosCatalogo={serviciosCatalogo}
        serviciosSeleccionados={serviciosSeleccionados}
        setServiciosSeleccionados={setServiciosSeleccionados}
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
      />

      <ConfirmarOrdenPanel
        total={calcularTotal()}
        onRegistrar={registrarOrden}
      />

      {mostrarFormularioCliente && (
        <div className="fixed inset-0 bg-black font-bold flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <FormularioCliente
              onClose={() => setMostrarFormularioCliente(false)}
              onSubmit={async (data: ClienteData) => {
                try {
                  const res = await clientesService.create(data);
                  setCliente(res.data);
                  toast.success("Cliente registrado correctamente");
                } catch (error) {
                  console.error("Error al registrar cliente:", error);
                  toast.error("Error al registrar cliente");
                }
                setMostrarFormularioCliente(false);
              }}
            />
            <div className="text-right font-bold mt-4">
              <button
                onClick={() => setMostrarFormularioCliente(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
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
