import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaTshirt,
  FaMoneyBillWave,
  FaCog,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../../../shared/types/types";
import type { JSX } from "react";

export default function Sidebar() {
  const location = useLocation();
  const { hasRole, isAuthenticated } = useAuth();

  const links: {
    section: string;
    items: { to: string; label: string; icon: JSX.Element; roles: Role[] }[];
  }[] = [
    {
      section: "Gestión",
      items: [
        {
          to: "/",
          label: "Inicio",
          icon: <FaHome />,
          roles: ["ADMIN", "EMPLOYEE"],
        },
        {
          to: "/ordenes",
          label: "Órdenes",
          icon: <FaClipboardList />,
          roles: ["ADMIN", "EMPLOYEE"],
        },
        {
          to: "/clientes",
          label: "Clientes",
          icon: <FaUsers />,
          roles: ["ADMIN", "EMPLOYEE"],
        },
        {
          to: "/servicios",
          label: "Servicios",
          icon: <FaTshirt />,
          roles: ["ADMIN", "EMPLOYEE"],
        },
      ],
    },
    {
      section: "Finanzas",
      items: [
        {
          to: "/pagos",
          label: "Pagos",
          icon: <FaMoneyBillWave />,
          roles: ["ADMIN", "EMPLOYEE"],
        },
      ],
    },
    {
      section: "Configuración",
      items: [
        {
          to: "/configuracion",
          label: "Configuración",
          icon: <FaCog />,
          roles: ["ADMIN"],
        },
      ],
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="w-64 bg-blue-700 text-white font-bold h-screen p-6 flex flex-col gap-6">
      <div className="text-2xl font-bold mb-2">Menú</div>
      <nav className="flex flex-col gap-6">
        {links.map((grupo) => {
          const visibleItems = grupo.items.filter((link) =>
            hasRole(link.roles)
          );

          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <div key={grupo.section}>
              <p className="text-xs uppercase font-semibold text-blue-300 mb-2 tracking-wide">
                {grupo.section}
              </p>
              <ul className="flex flex-col gap-2">
                {visibleItems.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 py-2 px-4 rounded transition ${
                        isActive
                          ? "bg-blue-600 font-semibold"
                          : "hover:bg-blue-600"
                      }`}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
