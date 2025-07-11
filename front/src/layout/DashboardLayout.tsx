import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardLayout() {
  const [nombreNegocio, setNombreNegocio] = useState("Lavandería");

  useEffect(() => {
    async function cargarNombreNegocio() {
      try {
        const res = await axios.get("/api/configuracion");
        setNombreNegocio(res.data.nombreNegocio || "Lavandería");
      } catch (error) {
        console.error("Error al obtener nombre del negocio:", error);
      }
    }
    cargarNombreNegocio();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header nombreNegocio={nombreNegocio} />
        <main className="p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
