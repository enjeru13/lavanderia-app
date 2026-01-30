import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { configuracionService } from "../services/configuracionService";
import type { Configuracion } from "@lavanderia/shared/types/types";

export default function DashboardLayout() {
  const [nombreNegocio, setNombreNegocio] = useState("Lavandería");
  const [isDarkMode, setIsDarkMode] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const location = useLocation();

  useEffect(() => {
    async function cargarNombreNegocio() {
      try {
        const res = await configuracionService.get();
        const config: Configuracion = res.data;
        setNombreNegocio(config.nombreNegocio || "Lavandería");
      } catch (error) {
        console.error("Error al obtener nombre del negocio:", error);
        toast.error("Error al cargar el nombre del negocio.");
      }
    }
    cargarNombreNegocio();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    // Initial sync
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isDarkMode]);

  // Removed manual toggle to rely on native system preference

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 font-inter transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col md:rounded-tl-2xl shadow-inner bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        <Header
          nombreNegocio={nombreNegocio}
        />

        <main className="flex-1 p-4 overflow-auto relative">
          <div
            key={location.pathname}
            className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 sm:p-8 min-h-[calc(100vh-160px)] transition-all duration-300 border border-gray-100 dark:border-gray-800/50"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
