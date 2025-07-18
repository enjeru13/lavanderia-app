import { useEffect, useState } from "react";
import axios from "axios";
import { FaCoins, FaStore } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { formatearTasa, parsearTasa } from "../utils/formatearMonedaHelpers";

export default function PantallaConfiguracion() {
  const [tasas, setTasas] = useState({ VES: "", COP: "" });
  const [monedaPrincipal, setMonedaPrincipal] = useState("USD");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [rif, setRif] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefonoPrincipal, setTelefonoPrincipal] = useState("");
  const [telefonoSecundario, setTelefonoSecundario] = useState("");
  const [mensajePieRecibo, setMensajePieRecibo] = useState("");

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const res = await axios.get("/api/configuracion");
        const config = res.data;

        setNombreNegocio(config.nombreNegocio ?? "");
        setMonedaPrincipal(config.monedaPrincipal ?? "USD");
        setTasas({
          VES: formatearTasa(config.tasaVES),
          COP: formatearTasa(config.tasaCOP),
        });

        setRif(config.rif ?? "");
        setDireccion(config.direccion ?? "");
        setTelefonoPrincipal(config.telefonoPrincipal ?? "");
        setTelefonoSecundario(config.telefonoSecundario ?? "");
        setMensajePieRecibo(config.mensajePieRecibo ?? "");
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    }
    cargarConfiguracion();
  }, []);

  const guardarConfiguracion = async () => {
    try {
      await axios.put("/api/configuracion", {
        nombreNegocio,
        monedaPrincipal,
        tasaVES: parsearTasa(tasas.VES),
        tasaCOP: parsearTasa(tasas.COP),
        rif,
        direccion,
        telefonoPrincipal,
        telefonoSecundario,
        mensajePieRecibo,
      });
      alert("Configuración guardada correctamente");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert("Error al guardar la configuración");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">
          <MdSettings size={24} />
          Configuración del sistema
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ajusta datos generales del negocio y tasas monetarias.
        </p>
      </header>

      {/* Información del negocio */}
      <section className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <FaStore />
          Información del negocio
        </h2>

        <div className="space-y-4">
          {/* Nombre comercial */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Nombre comercial
            </label>
            <input
              type="text"
              value={nombreNegocio}
              onChange={(e) => setNombreNegocio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. Lavandería Estrella"
            />
          </div>

          {/* RIF */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">RIF</label>
            <input
              type="text"
              value={rif}
              onChange={(e) => setRif(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. J-12345678-9"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Dirección fiscal
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. Av. Libertador, Local 5"
            />
          </div>

          {/* Teléfono principal */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Teléfono principal
            </label>
            <input
              type="text"
              value={telefonoPrincipal}
              onChange={(e) => setTelefonoPrincipal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. 0414-5551122"
            />
          </div>

          {/* Teléfono secundario */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Teléfono secundario
            </label>
            <input
              type="text"
              value={telefonoSecundario}
              onChange={(e) => setTelefonoSecundario(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. 0412-7773344"
            />
          </div>

          {/* Mensaje pie de recibo */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Mensaje pie de recibo
            </label>
            <textarea
              value={mensajePieRecibo}
              onChange={(e) => setMensajePieRecibo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm resize-y"
              placeholder="Ej. Gracias por su preferencia. Este ticket es indispensable para reclamos."
            />
          </div>
        </div>
      </section>

      {/* Tasas monetarias */}
      <section className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <FaCoins />
          Tasas de conversión
        </h2>

        <div className="space-y-4">
          {/* Moneda principal */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Moneda principal
            </label>
            <select
              value={monedaPrincipal}
              onChange={(e) => setMonedaPrincipal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
            >
              <option value="USD">Dólares (USD)</option>
              <option value="VES">Bolívares (VES)</option>
              <option value="COP">Pesos Colombianos (COP)</option>
            </select>
          </div>

          {/* Tasas */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Tasa VES por USD
              </label>
              <input
                type="number"
                step="any"
                value={tasas.VES}
                onChange={(e) => setTasas({ ...tasas, VES: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                placeholder="Ej. 140.00"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Tasa COP por USD
              </label>
              <input
                type="number"
                step="any"
                value={tasas.COP}
                onChange={(e) => setTasas({ ...tasas, COP: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                placeholder="Ej. 4000.00"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <button
          onClick={guardarConfiguracion}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-md flex items-center gap-2 transition-all"
        >
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
