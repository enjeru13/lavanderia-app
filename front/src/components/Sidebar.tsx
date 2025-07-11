import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaTshirt,
  FaCog,
} from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Inicio", icon: <FaHome /> },
    { to: "/clientes", label: "Clientes", icon: <FaUsers /> },
    { to: "/servicios", label: "Servicios", icon: <FaTshirt /> },
    { to: "/ordenes", label: "Órdenes", icon: <FaClipboardList /> },
    { to: "/configuracion", label: "Configuración", icon: <FaCog /> },
  ];

  return (
    <aside className="w-64 bg-blue-700 text-white h-screen p-6 flex flex-col gap-6">
      <div className="text-2xl font-bold mb-6">Menú</div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 py-2 px-4 rounded transition ${
                isActive ? "bg-blue-600 font-semibold" : "hover:bg-blue-600"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
