type Props = {
  observaciones: string;
  setObservaciones: (valor: string) => void;
};

export default function ObservacionesPanel({
  observaciones,
  setObservaciones,
}: Props) {
  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Observaciones</h2>
      <textarea
        placeholder="Notas adicionales o instrucciones especiales"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        rows={3}
      />
    </section>
  );
}
