import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { configuracionService } from "../services/configuracionService";
import type { Configuracion } from "@lavanderia/shared/types/types";

export default function DashboardLayout() {
  const [nombreNegocio, setNombreNegocio] = useState("Lavandería");

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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200 font-inter">
      <Sidebar />

      <div className="flex-1 flex flex-col rounded-tl-2xl shadow-inner bg-gray-50">
        <Header nombreNegocio={nombreNegocio} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 m-2 min-h-[calc(100vh-180px)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
