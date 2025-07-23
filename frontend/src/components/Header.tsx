import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  nombreNegocio: string;
}

export default function Header({ nombreNegocio }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center border-b border-gray-200">
      <div className="w-1/3"></div>

      <h1 className="text-2xl font-bold text-blue-600 text-center flex-1">
        {nombreNegocio}
      </h1>

      {user ? (
        <div className="flex items-center gap-4 w-1/3 justify-end">
          <span className="text-gray-700 font-medium flex items-center gap-2">
            <FaUserCircle className="text-indigo-600" size={23} />
            {user.name || user.email}
            <span className="text-xs text-gray-500 bg-gray-100 p-2 rounded-full capitalize">
              {user.role.toLowerCase()}
            </span>
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition flex items-center gap-2 font-semibold text-sm"
          >
            <FaSignOutAlt />
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <span className="text-gray-500 italic text-sm w-1/3 text-right">
          No autenticado
        </span>
      )}
    </header>
  );
}
