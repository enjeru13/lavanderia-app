import { z } from "zod";

export const ServicioSchema = z.object({
  nombreServicio: z.string().min(1),
  precioBase: z.number().min(0),
  descripcion: z.string().optional(),
});
