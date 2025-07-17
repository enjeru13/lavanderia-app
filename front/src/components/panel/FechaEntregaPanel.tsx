type Props = {
  fechaEntrega: string;
  setFechaEntrega: (fecha: string) => void;
};

export default function FechaEntregaPanel({
  fechaEntrega,
  setFechaEntrega,
}: Props) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-lg space-y-4">
      <header>
        <h2 className="text-lg font-bold text-gray-800">
          Fecha estimada de entrega
        </h2>
        <p className="text-sm text-gray-500">
          Esta fecha es opcional y solo sirve como referencia interna.
        </p>
      </header>

      <input
        type="date"
        value={fechaEntrega}
        onChange={(e) => setFechaEntrega(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </section>
  );
}
