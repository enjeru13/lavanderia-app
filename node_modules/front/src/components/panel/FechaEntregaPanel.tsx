import { FaCalendarAlt } from "react-icons/fa";

type Props = {
  fechaEntrega: string;
  setFechaEntrega: (fecha: string) => void;
};

export default function FechaEntregaPanel({
  fechaEntrega,
  setFechaEntrega,
}: Props) {
  return (
    <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
      <header className="pb-4 border-b border-gray-200 mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FaCalendarAlt size={28} className="text-orange-500" />
          Fecha estimada de entrega
        </h2>
        <p className="text-base text-gray-600 mt-2">
          Esta fecha es opcional y solo sirve como referencia interna.
        </p>
      </header>

      <input
        type="date"
        value={fechaEntrega}
        onChange={(e) => setFechaEntrega(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 shadow-sm transition duration-200"
      />
    </section>
  );
}
