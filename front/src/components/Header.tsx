type Props = {
  nombreNegocio: string;
};

export default function Header({ nombreNegocio }: Props) {
  return (
    <header className="bg-white shadow p-4 flex justify-center items-center">
      <h1 className="text-xl font-bold text-blue-600">{nombreNegocio}</h1>
    </header>
  );
}
