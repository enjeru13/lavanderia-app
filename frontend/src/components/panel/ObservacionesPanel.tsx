import { BiMessageSquareDetail } from "react-icons/bi";

type Props = {
  observaciones: string;
  setObservaciones: (valor: string) => void;
};

export default function ObservacionesPanel({
  observaciones,
  setObservaciones,
}: Props) {
  const maxCaracteres = 180;
  const caracteresRestantes = maxCaracteres - observaciones.length;
  const cercaDelLimite = caracteresRestantes <= 20;

  return (
    <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
      <header className="pb-4 border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <BiMessageSquareDetail size={28} className="text-purple-500" />
          Observaciones
        </h2>
      </header>

      <textarea
        value={observaciones}
        onChange={(e) => {
          const valor = e.target.value;
          if (valor.length <= maxCaracteres) {
            setObservaciones(valor);
          }
        }}
        placeholder="Escribe aquí cualquier nota adicional o instrucción especial para la orden..."
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y bg-gray-100 shadow-sm transition duration-200 min-h-[100px]"
      />

      <p
        className={`text-sm text-right ${
          cercaDelLimite ? "text-red-500 font-semibold" : "text-gray-500"
        }`}
      >
        {observaciones.length}/{maxCaracteres} caracteres
      </p>
    </section>
  );
}
