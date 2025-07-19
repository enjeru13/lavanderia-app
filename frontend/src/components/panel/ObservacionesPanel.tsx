type Props = {
  observaciones: string;
  setObservaciones: (valor: string) => void;
};

export default function ObservacionesPanel({
  observaciones,
  setObservaciones,
}: Props) {
  return (
    <section className="bg-white p-6 font-medium rounded-xl shadow-lg space-y-4">
      <header>
        <h2 className="text-xl font-bold mb-6 text-gray-800">Observaciones</h2>
      </header>

      <textarea
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        placeholder="Notas adicionales o instrucciones especiales"
        rows={4}
        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-y bg-gray-50 placeholder:text-gray-400"
      />
    </section>
  );
}
