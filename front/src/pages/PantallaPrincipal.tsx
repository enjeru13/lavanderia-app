/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";
import FormularioCliente from "../components/FormularioCliente";
import ListaClientesModal from "../components/ListaClientesModal";
import { toast } from "react-toastify";

export default function PantallaPrincipal() {
  const [cliente, setCliente] = useState<any>(null);
  const [mostrarFormularioCliente, setMostrarFormularioCliente] =
    useState(false);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const [serviciosCatalogo, setServiciosCatalogo] = useState<any[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<any[]>(
    []
  );
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
      {/* 📦 Cliente */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-3">Cliente</h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            {cliente ? (
              <span className="px-3 py-2 bg-green-100 rounded text-green-800 font-medium">
                {cliente.nombre} {cliente.apellido}
              </span>
            ) : (
              <span className="text-gray-500">No hay cliente asignado</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarFormularioCliente(true)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Registrar cliente
            </button>
            <button
              onClick={() => setMostrarListaClientes(true)}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Seleccionar cliente
            </button>
          </div>
        </div>
      </section>

      {/* 🧺 Servicios */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Servicios disponibles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviciosCatalogo.map((servicio) => {
            const actual = serviciosSeleccionados.find(
              (s) => s.servicioId === servicio.id
            );
            const cantidad = actual ? actual.cantidad : 0;
            const subtotal = cantidad * servicio.precioBase;

            return (
              <div key={servicio.id} className="border rounded p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {servicio.nombreServicio}
                </h3>
                <p className="text-sm text-gray-600">
                  Precio base: ${servicio.precioBase.toFixed(2)}
                </p>
                <input
                  type="number"
                  min={0}
                  value={cantidad}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setServiciosSeleccionados((prev) => {
                      const otros = prev.filter(
                        (s) => s.servicioId !== servicio.id
                      );
                      return value > 0
                        ? [
                            ...otros,
                            { servicioId: servicio.id, cantidad: value },
                          ]
                        : [...otros];
                    });
                  }}
                  className="mt-2 px-2 py-1 border rounded w-full"
                  placeholder="Cantidad"
                />
                {cantidad > 0 && (
                  <p className="mt-2 text-green-700 text-sm font-medium">
                    Subtotal: ${subtotal.toFixed(2)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ✍️ Observaciones */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Observaciones</h2>
        <textarea
          placeholder="Notas adicionales o instrucciones especiales"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={3}
        />
      </section>

      {/* 📅 Fecha estimada */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Fecha estimada de entrega</h2>
        <input
          type="date"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Opcional. Fecha estimada de entrega.
        </p>
      </section>

      {/* 🧾 Resumen de la orden */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-3">Resumen de la orden</h2>

        <div className="space-y-2 text-sm text-gray-700">
          {/* Cliente */}
          <div>
            <span className="font-semibold">Cliente:</span>{" "}
            {cliente ? `${cliente.nombre} ${cliente.apellido}` : "No asignado"}
          </div>

          {/* Servicios */}
          <div>
            <span className="font-semibold block mb-1">
              Servicios seleccionados:
            </span>
            {serviciosSeleccionados.length === 0 ? (
              <p className="text-gray-500">Ningún servicio seleccionado</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {serviciosSeleccionados.map((s) => {
                  const servicio = serviciosCatalogo.find(
                    (x) => x.id === s.servicioId
                  );
                  return (
                    <li key={s.servicioId}>
                      {servicio?.nombreServicio} — {s.cantidad} unidad(es) → $
                      {(servicio?.precioBase * s.cantidad).toFixed(2)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Observaciones */}
          {observaciones && (
            <div>
              <span className="font-semibold">Observaciones:</span>{" "}
              {observaciones}
            </div>
          )}

          {/* Fecha estimada */}
          {fechaEntrega && (
            <div>
              <span className="font-semibold">Fecha de entrega:</span>{" "}
              {new Date(fechaEntrega).toLocaleDateString()}
            </div>
          )}
        </div>
      </section>

      {/* Confirmación */}
      <section className="bg-white p-4 rounded shadow text-right">
        <p className="text-lg font-bold text-green-700 mb-3">
          Total: ${calcularTotal().toFixed(2)}
        </p>
        <button
          onClick={registrarOrden}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Registrar Orden
        </button>
      </section>

      {/* Modales */}
      {mostrarFormularioCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
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
            <div className="text-right mt-4">
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
