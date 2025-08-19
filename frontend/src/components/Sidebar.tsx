import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaTshirt,
  FaMoneyBillWave,
  FaCog,
  FaChartBar,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "@lavanderia/shared/types/types";
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
          roles: ["ADMIN"],
        },
        {
          to: "/estado-ordenes",
          label: "Estado de Órdenes",
          icon: <FaChartBar />,
          roles: ["ADMIN"],
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
    <aside className="w-64 bg-gradient-to-br from-blue-900 to-blue-700 text-white min-h-screen p-7 flex flex-col gap-8 shadow-2xl sticky top-0">
      <div className="text-3xl font-extrabold text-white mb-6 tracking-wide pb-4">
        Menú
      </div>
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
              <p className="text-xs uppercase font-bold text-blue-200 mb-3 tracking-wider opacity-80">
                {grupo.section}
              </p>
              <ul className="flex flex-col gap-2">
                {visibleItems.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`
                        flex items-center gap-4 py-3 px-5 rounded-lg transition-all duration-200 ease-in-out group
                        ${
                          isActive
                            ? "bg-blue-500 text-white shadow-lg transform translate-x-2 font-bold ring-2 ring-blue-300"
                            : "text-blue-100 hover:bg-blue-700/50 hover:text-white hover:shadow-md hover:transform hover:translate-x-1"
                        }
                      `}
                    >
                      <span
                        className={`text-xl ${
                          isActive
                            ? "text-white"
                            : "text-blue-300 group-hover:text-white"
                        }`}
                      >
                        {link.icon}
                      </span>
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
