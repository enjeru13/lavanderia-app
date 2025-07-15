type Servicio = {
  id: number;
  nombreServicio: string;
  precioBase: number;
};

type Seleccionado = {
  servicioId: number;
  cantidad: number;
};

type Props = {
  serviciosCatalogo: Servicio[];
  serviciosSeleccionados: Seleccionado[];
  setServiciosSeleccionados: React.Dispatch<
    React.SetStateAction<Seleccionado[]>
  >;
};

export default function ServiciosPanel({
  serviciosCatalogo,
  serviciosSeleccionados,
  setServiciosSeleccionados,
}: Props) {
  const actualizarCantidad = (servicioId: number, cantidad: number) => {
    setServiciosSeleccionados((prev: Seleccionado[]) => {
      const otros = prev.filter((s) => s.servicioId !== servicioId);
      return cantidad > 0 ? [...otros, { servicioId, cantidad }] : [...otros];
    });
  };

  return (
    <section className="bg-white p-4 font-semibold rounded shadow">
      <h2 className="text-lg font-bold mb-4">Servicios disponibles</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviciosCatalogo.map((servicio) => {
          const actual = serviciosSeleccionados.find(
            (s) => s.servicioId === servicio.id
          );
          const cantidad = actual?.cantidad || 0;
          const subtotal = cantidad * servicio.precioBase;

          return (
            <div key={servicio.id} className="border rounded p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-1">
                {servicio.nombreServicio}
              </h3>
              <p className="text-sm text-gray-600">
                Precio base: $ {servicio.precioBase.toFixed(2)}
              </p>
              <input
                type="number"
                min={0}
                value={cantidad}
                onChange={(e) =>
                  actualizarCantidad(servicio.id, parseInt(e.target.value))
                }
                className="mt-2 p-2 border rounded w-full"
                placeholder="Cantidad"
              />
              {cantidad > 0 && (
                <p className="mt-2 text-green-700 text-sm font-medium">
                  Subtotal: $ {subtotal.toFixed(2)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
