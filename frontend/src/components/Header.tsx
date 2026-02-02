import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";

interface HeaderProps {
  nombreNegocio: string;
}

export default function Header({
  nombreNegocio,
}: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-linear-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 shadow-xl py-4 px-6 sm:px-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 rounded-b-xl transition-all duration-300">
      <div className="flex-1 min-w-[50px] flex items-center" />

      <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 dark:text-blue-400 text-center grow italic transition-all duration-300">
        {nombreNegocio}
      </h1>

      {user ? (
        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-full shadow-inner border border-blue-100 dark:border-blue-800/50 transition-colors">
            <FaUserCircle className="text-indigo-600 dark:text-indigo-400 text-xl sm:text-2xl" />
            <span className="text-gray-800 dark:text-gray-200 font-bold text-sm sm:text-base">
              {user.name || user.email}
            </span>
            <span className="hidden sm:inline-block text-[10px] text-blue-800 dark:text-blue-200 bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded-full capitalize font-bold shadow-sm">
              {user.role.toLowerCase()}
            </span>
          </div>

          <Button
            onClick={logout}
            variant="danger"
            leftIcon={<FaSignOutAlt size={16} />}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="whitespace-nowrap"
          >
            <span className="hidden md:inline">Cerrar Sesión</span>
          </Button>
        </div>
      ) : (
        <span className="text-gray-400 italic text-sm flex-1 text-right">
          No autenticado
        </span>
      )}
    </header>
  );
}