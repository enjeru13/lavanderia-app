import { useEffect, useState } from "react";
import { FaCoins, FaStore } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { toast } from "react-toastify";
import {
  formatearTasa,
  parsearTasa,
  normalizarMoneda,
  type Moneda,
} from "../utils/monedaHelpers";
import { configuracionService } from "../services/configuracionService";
import type { Configuracion } from "../../../shared/types/types";

export default function PantallaConfiguracion() {
  const [tasas, setTasas] = useState({ VES: "", COP: "" });
  const [monedaPrincipal, setMonedaPrincipal] = useState<Moneda>("USD");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [rif, setRif] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefonoPrincipal, setTelefonoPrincipal] = useState("");
  const [telefonoSecundario, setTelefonoSecundario] = useState("");
  const [mensajePieRecibo, setMensajePieRecibo] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const res = await configuracionService.get();
        const config: Configuracion = res.data;

        setNombreNegocio(config.nombreNegocio ?? "");
        setMonedaPrincipal(normalizarMoneda(config.monedaPrincipal ?? "USD"));
        setTasas({
          VES: formatearTasa(config.tasaVES ?? ""),
          COP: formatearTasa(config.tasaCOP ?? ""),
        });
        setRif(config.rif ?? "");
        setDireccion(config.direccion ?? "");
        setTelefonoPrincipal(config.telefonoPrincipal ?? "");
        setTelefonoSecundario(config.telefonoSecundario ?? "");
        setMensajePieRecibo(config.mensajePieRecibo ?? "");
      } catch (error) {
        console.error("Error al cargar configuración:", error);
        toast.error("Error al cargar la configuración.");
      }
    }
    cargarConfiguracion();
  }, []);

  const guardarConfiguracion = async () => {
    setCargando(true);
    try {
      const principalValidada: Moneda = normalizarMoneda(monedaPrincipal);
      await configuracionService.update({
        nombreNegocio: nombreNegocio.trim() || null,
        monedaPrincipal: principalValidada,
        tasaVES: parsearTasa(tasas.VES),
        tasaCOP: parsearTasa(tasas.COP),
        rif: rif.trim() || null,
        direccion: direccion.trim() || null,
        telefonoPrincipal: telefonoPrincipal.trim() || null,
        telefonoSecundario: telefonoSecundario.trim() || null,
        mensajePieRecibo: mensajePieRecibo.trim() || null,
      });
      toast.success("Configuración guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast.error("Error al guardar la configuración.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10">
      <header className="pb-4 border-b border-gray-200 mb-6">
        <h1 className="text-4xl font-extrabold flex items-center gap-3 text-gray-900">
          <MdSettings size={36} className="text-indigo-600" />
          Configuración del sistema
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Ajusta datos generales del negocio y tasas monetarias.
        </p>
      </header>

      <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
          <FaStore size={28} className="text-indigo-500" />
          Información del negocio
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre comercial
            </label>
            <input
              type="text"
              value={nombreNegocio}
              onChange={(e) => setNombreNegocio(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm transition duration-200"
              placeholder="Ej. Lavandería Estrella"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              RIF
            </label>
            <input
              type="text"
              value={rif}
              onChange={(e) => setRif(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm transition duration-200"
              placeholder="Ej. J-12345678-9"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dirección fiscal
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm transition duration-200"
              placeholder="Ej. Av. Libertador, Local 5"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Teléfono principal
            </label>
            <input
              type="text"
              value={telefonoPrincipal}
              onChange={(e) => setTelefonoPrincipal(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm transition duration-200"
              placeholder="Ej. 0414-5551122"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Teléfono secundario
            </label>
            <input
              type="text"
              value={telefonoSecundario}
              onChange={(e) => setTelefonoSecundario(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm transition duration-200"
              placeholder="Ej. 0412-7773344"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mensaje pie de recibo
            </label>
            <textarea
              value={mensajePieRecibo}
              onChange={(e) => setMensajePieRecibo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base resize-y min-h-[100px] shadow-sm transition duration-200"
              placeholder="Ej. Gracias por su preferencia. Este ticket es indispensable para reclamos."
              rows={4}
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
          <FaCoins size={28} className="text-green-500" />
          Tasas de conversión
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Moneda principal
            </label>
            <select
              value={monedaPrincipal}
              onChange={(e) =>
                setMonedaPrincipal(normalizarMoneda(e.target.value))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm transition duration-200"
            >
              <option value="USD">Dólares (USD)</option>
              <option value="VES">Bolívares (VES)</option>
              <option value="COP">Pesos Colombianos (COP)</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tasa VES por USD
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={tasas.VES}
                onChange={(e) =>
                  setTasas({ ...tasas, VES: e.target.value.replace(".", ",") })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm transition duration-200"
                placeholder="Ej. 140,00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tasa COP por USD
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={tasas.COP}
                onChange={(e) =>
                  setTasas({ ...tasas, COP: e.target.value.replace(".", ",") })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base shadow-sm transition duration-200"
                placeholder="Ej. 4000,00"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={guardarConfiguracion}
          disabled={cargando}
          className={`px-8 py-3.5 rounded-lg flex items-center gap-3 transition-all duration-200 ease-in-out font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
            cargando
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {cargando ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Guardando...
            </>
          ) : (
            "Guardar configuración"
          )}{" "}
        </button>
      </div>
    </div>
  );
}
