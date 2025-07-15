import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaTshirt,
  FaMoneyBillWave,
  FaCog,
} from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    {
      section: "Gestión",
      items: [
        { to: "/", label: "Inicio", icon: <FaHome /> },
        { to: "/clientes", label: "Clientes", icon: <FaUsers /> },
        { to: "/servicios", label: "Servicios", icon: <FaTshirt /> },
        { to: "/ordenes", label: "Órdenes", icon: <FaClipboardList /> },
      ],
    },
    {
      section: "Finanzas",
      items: [
        { to: "/pagos", label: "Pagos", icon: <FaMoneyBillWave /> },
      ],
    },
    {
      section: "Configuración",
      items: [
        { to: "/configuracion", label: "Configuración", icon: <FaCog /> },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-blue-700 text-white h-screen p-6 flex flex-col gap-6">
      <div className="text-2xl font-bold mb-2">Menú</div>
      <nav className="flex flex-col gap-6">
        {links.map((grupo) => (
          <div key={grupo.section}>
            <p className="text-xs uppercase font-semibold text-blue-300 mb-2 tracking-wide">
              {grupo.section}
            </p>
            <ul className="flex flex-col gap-2">
              {grupo.items.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 py-2 px-4 rounded transition ${
                      isActive ? "bg-blue-600 font-semibold" : "hover:bg-blue-600"
                    }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}