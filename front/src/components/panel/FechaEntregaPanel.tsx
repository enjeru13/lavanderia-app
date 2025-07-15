type Props = {
  fechaEntrega: string;
  setFechaEntrega: (fecha: string) => void;
};

export default function FechaEntregaPanel({
  fechaEntrega,
  setFechaEntrega,
}: Props) {
  return (
    <section className="bg-white p-4 font-semibold rounded shadow">
      <h2 className="text-lg font-bold mb-2">Fecha estimada de entrega</h2>
      <input
        type="date"
        value={fechaEntrega}
        onChange={(e) => setFechaEntrega(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <p className="text-xs text-gray-500 mt-1">
        Opcional. Fecha estimada en la que el pedido podría estar listo.
      </p>
    </section>
  );
}
