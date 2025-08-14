import { z } from "zod";
import dayjs from "dayjs";

const fechaTransformada = z
  .union([z.string(), z.null(), z.undefined()])
  .optional()
  .transform((val) => {
    if (val === null || val === undefined || val === "") return null;
    const fecha = dayjs(val);
    return fecha.isValid() ? fecha.toDate() : null;
  })
  .refine((val) => val === null || val instanceof Date, {
    message: "Fecha inválida",
  });

export const ordenSchema = z.object({
  clienteId: z.number().int().positive("ID de cliente inválido"),

  estado: z.enum(["PENDIENTE", "ENTREGADO"], {
    errorMap: () => ({ message: "Estado de orden inválido" }),
  }),

  observaciones: z.string().nullable().optional(),

  fechaEntrega: fechaTransformada,

  servicios: z
    .array(
      z.object({
        servicioId: z.number().int().positive("ID de servicio inválido"),
        cantidad: z
          .union([z.number(), z.string()])
          .transform((val) =>
            typeof val === "string"
              ? Number(val.replace(",", ".").replace(/\s/g, ""))
              : val
          )
          .refine((n) => n > 0 && !isNaN(n), {
            message: "La cantidad debe ser un número válido mayor que 0",
          }),
      })
    )
    .min(1, "Debes agregar al menos un servicio a la orden"),
});

export const ordenUpdateSchema = ordenSchema.partial();
export const ObservacionUpdateSchema = z.object({
  observaciones: z.string().nullable().optional(),
});
