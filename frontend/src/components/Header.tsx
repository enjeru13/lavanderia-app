import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  nombreNegocio: string;
}

export default function Header({ nombreNegocio }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-lg py-5 px-6 flex justify-between items-center border-b border-gray-200 sticky top-0 z-50 rounded-b-xl">
      <div className="flex-1"></div>

      <h1 className="text-2xl font-extrabold text-blue-700 text-center flex-grow">
        {nombreNegocio}
      </h1>

      {user ? (
        <div className="flex items-center gap-5 flex-1 justify-end">
          <span className="text-gray-700 font-semibold flex items-center gap-2">
            <FaUserCircle className="text-indigo-700" size={26} />
            {user.name || user.email}
            <span className="text-xs text-blue-700 bg-blue-100 px-3 py-1 rounded-full capitalize font-semibold shadow-sm">
              {user.role.toLowerCase()}
            </span>
          </span>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 ease-in-out transform hover:scale-105 flex items-center gap-2 font-bold text-sm shadow-md"
            aria-label="Cerrar sesión"
          >
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
