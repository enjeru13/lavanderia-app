import { useEffect, useState } from "react";
import axios from "axios";
import { FaCoins, FaStore } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { formatearTasa, parsearTasa } from "../utils/formatearMonedaHelpers";

export default function PantallaConfiguracion() {
  const [tasas, setTasas] = useState({ VES: "", COP: "" });
  const [monedaPrincipal, setMonedaPrincipal] = useState("USD");
  const [nombreNegocio, setNombreNegocio] = useState("");

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const res = await axios.get("/api/configuracion");
        const config = res.data;
        setNombreNegocio(config.nombreNegocio);
        setMonedaPrincipal(config.monedaPrincipal);
        setTasas({
          VES: formatearTasa(config.tasaVES),
          COP: formatearTasa(config.tasaCOP),
        });
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
        <div className="space-y-2">
          <label className="block text-sm text-gray-600">
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
      </section>

      {/* Tasas monetarias */}
      <section className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <FaCoins />
          Tasas de conversión
        </h2>

        <div className="space-y-4">
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
