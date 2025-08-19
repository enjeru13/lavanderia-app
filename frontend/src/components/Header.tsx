import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  nombreNegocio: string;
}

export default function Header({ nombreNegocio }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-gray-50 to-white shadow-xl py-4 px-6 sm:px-8 flex items-center justify-between border-b border-gray-200 sticky top-0 z-50 rounded-b-xl">
      <div className="flex-1 min-w-[50px]"></div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 text-center flex-grow">
        {nombreNegocio}
      </h1>

      {user ? (
        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full shadow-inner">
            <FaUserCircle className="text-indigo-600 text-xl sm:text-2xl" />
            <span className="text-gray-800 font-semibold text-sm sm:text-base">
              {user.name || user.email}
            </span>
            <span className="text-xs text-blue-800 bg-blue-200 px-2 py-0.5 rounded-full capitalize font-bold shadow-sm">
              {user.role.toLowerCase()}
            </span>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 ease-in-out transform hover:scale-105 flex items-center gap-2 font-bold text-sm shadow-md"
            aria-label="Cerrar sesión"
          >
            <FaSignOutAlt size={24} />
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <span className="text-gray-400 italic text-sm flex-1 text-right">
          No autenticado
        </span>
      )}
    </header>
  );
}
