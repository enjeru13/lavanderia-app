import { z } from "zod";

export const ClienteSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  tipo: z.enum(["NATURAL", "EMPRESA"], {
    errorMap: () => ({ message: "Tipo de cliente inválido" }),
  }),
  telefono: z
    .string()
    .min(6, "El teléfono debe tener al menos 6 caracteres")
    .max(20, "El teléfono no puede exceder los 20 caracteres")
    .regex(/^[0-9()+\-.\s]+$/, "Formato de teléfono inválido"),

  telefono_secundario: z.string().nullable().optional(),

  direccion: z.string().min(4, "La dirección debe tener al menos 4 caracteres"),
  identificacion: z
    .string()
    .regex(
      /^(V|J|E)-\d{6,10}$/,
      "Formato de identificación inválido (Ej: V-12345678)"
    ),

  email: z.string().email("Formato de correo inválido").nullable().optional(),
});
