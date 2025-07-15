/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Componentes panel
import ClientePanel from "../components/panel/ClientePanel";
import ServiciosPanel from "../components/panel/ServiciosPanel";
import ObservacionesPanel from "../components/panel/ObservacionesPanel";
import FechaEntregaPanel from "../components/panel/FechaEntregaPanel";

// Modales
import FormularioCliente from "../components/formulario/FormularioCliente";
import ListaClientesModal from "../components/modal/ListaClientesModal";
import ResumenOrdenPanel from "../components/panel/ResumenOrdenPanel";
import ConfirmarOrdenPanel from "../components/panel/ConfirmarOrdenPanel";

export default function PantallaPrincipal() {
  const [cliente, setCliente] = useState<any>(null);
  const [mostrarFormularioCliente, setMostrarFormularioCliente] =
    useState(false);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const [serviciosCatalogo, setServiciosCatalogo] = useState<any[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<
    { servicioId: number; cantidad: number }[]
  >([]);
  const [observaciones, setObservaciones] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");

  useEffect(() => {
    axios
      .get("/api/servicios")
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

    const orden = {
      cliente_id: cliente.id,
      estado: "PENDIENTE",
      observaciones,
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
      servicios: serviciosSeleccionados,
    };

    try {
      await axios.post("/api/ordenes", orden);
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
      return total + (servicio?.precioBase || 0) * item.cantidad;
    }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Cliente */}
      <ClientePanel
        cliente={cliente}
        onAbrirFormulario={() => setMostrarFormularioCliente(true)}
        onAbrirLista={() => setMostrarListaClientes(true)}
      />

      {/* Servicios */}
      <ServiciosPanel
        serviciosCatalogo={serviciosCatalogo}
        serviciosSeleccionados={serviciosSeleccionados}
        setServiciosSeleccionados={setServiciosSeleccionados}
      />

      {/* Observaciones */}
      <ObservacionesPanel
        observaciones={observaciones}
        setObservaciones={setObservaciones}
      />

      {/* Fecha estimada */}
      <FechaEntregaPanel
        fechaEntrega={fechaEntrega}
        setFechaEntrega={setFechaEntrega}
      />

      {/* Resumen de orden */}
      <ResumenOrdenPanel
        cliente={cliente}
        serviciosSeleccionados={serviciosSeleccionados}
        serviciosCatalogo={serviciosCatalogo}
        observaciones={observaciones}
        fechaEntrega={fechaEntrega}
      />

      {/* Confirmar */}
      <ConfirmarOrdenPanel
        total={calcularTotal()}
        onRegistrar={registrarOrden}
      />

      {/* Modales */}
      {mostrarFormularioCliente && (
        <div className="fixed inset-0 bg-black font-bold flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <FormularioCliente
              onClose={() => setMostrarFormularioCliente(false)}
              onSubmit={async (data: any) => {
                try {
                  const res = await axios.post("/api/clientes", data);
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
          onSelect={(c: any) => {
            setCliente(c);
            setMostrarListaClientes(false);
          }}
        />
      )}
    </div>
  );
}
