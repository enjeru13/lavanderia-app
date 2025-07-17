type Props = {
  total: number;
  onRegistrar: () => void;
};

export default function ConfirmarOrdenPanel({ total, onRegistrar }: Props) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-lg font-medium space-y-4 text-right">
      <div>
        <p className="text-sm text-gray-500 mb-1">Total de la orden</p>
        <p className="text-2xl font-bold text-green-700 tracking-tight">
          ${total.toFixed(2)}
        </p>
      </div>

      <button
        onClick={onRegistrar}
        className="bg-green-600 hover:bg-green-700 transition-all text-white px-6 py-3 rounded-md text-sm font-semibold"
      >
        Confirmar registro
      </button>
    </section>
  );
}
