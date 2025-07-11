type Props = {
  total: number;
  onRegistrar: () => void;
};

export default function ConfirmarOrdenPanel({ total, onRegistrar }: Props) {
  return (
    <section className="bg-white p-4 rounded shadow text-right">
      <p className="text-lg font-bold text-green-700 mb-3">
        Total: ${total.toFixed(2)}
      </p>
      <button
        onClick={onRegistrar}
        className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
      >
        Registrar Orden
      </button>
    </section>
  );
}
