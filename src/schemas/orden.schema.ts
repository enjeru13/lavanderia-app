import { z } from "zod";

export const ordenSchema = z.object({
  cliente_id: z.number().int(),
  estado: z.enum(["PENDIENTE", "ENTREGADO"]),
  observaciones: z.string().optional(),
  fechaEntrega: z
    .union([z.string(), z.null()])
    .optional()
    .refine((val) => val === null || !val || !isNaN(Date.parse(val)), {
      message: "Fecha inválida",
    }),
  servicios: z
    .array(
      z.object({
        servicioId: z.number().int(),
        cantidad: z.number().positive("La cantidad debe ser mayor que 0"),
      })
    )
    .min(1, "Debes agregar al menos un servicio a la orden"),
});

export const ordenUpdateSchema = ordenSchema.partial();
