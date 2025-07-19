import { useEffect, useState } from "react";
import { FaCoins, FaStore } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import {
  formatearTasa,
  parsearTasa,
  normalizarMoneda,
  type Moneda,
} from "../utils/monedaHelpers";
import { configuracionService } from "../services/configuracionService";
import type { Configuracion } from "../types/types";

export default function PantallaConfiguracion() {
  const [tasas, setTasas] = useState({ VES: "", COP: "" });
  const [monedaPrincipal, setMonedaPrincipal] = useState<Moneda>("USD");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [rif, setRif] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefonoPrincipal, setTelefonoPrincipal] = useState("");
  const [telefonoSecundario, setTelefonoSecundario] = useState("");
  const [mensajePieRecibo, setMensajePieRecibo] = useState("");

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const res = await configuracionService.get();
        const config: Configuracion = res.data;

        setNombreNegocio(config.nombreNegocio ?? "");
        setMonedaPrincipal(normalizarMoneda(config.monedaPrincipal));
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
      const principalValidada: Moneda = normalizarMoneda(monedaPrincipal);
      await configuracionService.update({
        nombreNegocio,
        monedaPrincipal: principalValidada,
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

      <section className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <FaStore />
          Información del negocio
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Nombre comercial
            </label>
            <input
              type="text"
              value={nombreNegocio}
              onChange={(e) => setNombreNegocio(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. Lavandería Estrella"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">RIF</label>
            <input
              type="text"
              value={rif}
              onChange={(e) => setRif(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. J-12345678-9"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Dirección fiscal
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. Av. Libertador, Local 5"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Teléfono principal
            </label>
            <input
              type="text"
              value={telefonoPrincipal}
              onChange={(e) => setTelefonoPrincipal(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. 0414-5551122"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Teléfono secundario
            </label>
            <input
              type="text"
              value={telefonoSecundario}
              onChange={(e) => setTelefonoSecundario(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="Ej. 0412-7773344"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Mensaje pie de recibo
            </label>
            <textarea
              value={mensajePieRecibo}
              onChange={(e) => setMensajePieRecibo(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 text-sm resize-y"
              placeholder="Ej. Gracias por su preferencia. Este ticket es indispensable para reclamos."
            />
          </div>
        </div>
      </section>

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
              onChange={(e) =>
                setMonedaPrincipal(normalizarMoneda(e.target.value))
              }
              className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 text-sm"
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
                className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 text-sm"
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
                className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 text-sm"
                placeholder="Ej. 4000.00"
              />
            </div>
          </div>
        </div>
      </section>

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
