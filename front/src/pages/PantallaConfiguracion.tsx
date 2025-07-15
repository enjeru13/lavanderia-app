import { useEffect, useState } from "react";
import axios from "axios";
import { FaCoins, FaStore } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { formatearTasa, parsearTasa } from "../utils/formatearMonedaHelpers";

export default function PantallaConfiguracion() {
  const [tasas, setTasas] = useState({ VES: "", COP: "" });
  const [monedaPrincipal, setMonedaPrincipal] = useState("USD");
  const [nombreNegocio, setNombreNegocio] = useState("");

  // Cargar configuración al iniciar
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

  // Guardar configuración
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
      <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">
        <MdSettings size={28} /> Configuración del Sistema
      </h1>

      {/* Datos del negocio */}
      <section className="bg-white font-semibold rounded shadow p-4 space-y-4">
        <h2 className="text-lg flex items-center gap-2 text-gray-700">
          <FaStore /> Información del negocio
        </h2>
        <label className="block text-sm text-gray-700">
          Nombre del negocio:
          <input
            type="text"
            value={nombreNegocio}
            onChange={(e) => setNombreNegocio(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded"
            placeholder="Ej. Lavandería Estrella"
          />
        </label>
      </section>

      {/* Tasas de conversión */}
      <section className="bg-white font-semibold rounded shadow p-4 space-y-4">
        <h2 className="text-lg flex items-center gap-2 text-gray-700">
          <FaCoins /> Tasas de moneda
        </h2>

        <label className="block text-sm text-gray-700">
          Moneda principal:
          <select
            value={monedaPrincipal}
            onChange={(e) => setMonedaPrincipal(e.target.value)}
            className="mt-1 w-full border p-2 rounded"
          >
            <option value="USD">Dólares (USD)</option>
            <option value="VES">Bolívares (VES)</option>
            <option value="COP">Pesos Colombianos (COP)</option>
          </select>
        </label>

        <label className="block text-sm text-gray-700">
          Tasa de VES por USD:
          <input
            type="number"
            step="any"
            value={tasas.VES}
            onChange={(e) => setTasas({ ...tasas, VES: e.target.value })}
            className="mt-1 w-full border p-2 rounded"
            placeholder="Ej. 140.00"
          />
        </label>

        <label className="block text-sm text-gray-700">
          Tasa de COP por USD:
          <input
            type="number"
            step="any"
            value={tasas.COP}
            onChange={(e) => setTasas({ ...tasas, COP: e.target.value })}
            className="mt-1 w-full border p-2 rounded"
            placeholder="Ej. 4.000"
          />
        </label>
      </section>

      {/* Botón guardar */}
      <div className="items-center flex justify-end">
        <button
          onClick={guardarConfiguracion}
          className="bg-green-600 text-white font-bold p-3 rounded hover:bg-green-700 flex items-center gap-2"
        >
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
