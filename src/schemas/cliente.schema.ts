import { z } from "zod";

export const ClienteSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre es obligatorio")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo letras permitidas"),

  apellido: z
    .string()
    .min(2, "El apellido es obligatorio")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo letras permitidas"),

  tipo: z.enum(["NATURAL", "EMPRESA"], {
    errorMap: () => ({ message: "Tipo de cliente inválido" }),
  }),

  telefono: z
    .string()
    .regex(
      /^\d{7,15}$/,
      "El teléfono debe contener solo números (7 a 15 dígitos)"
    ),

  telefono_secundario: z
    .string()
    .regex(
      /^\d{7,15}$/,
      "El teléfono debe contener solo números (7 a 15 dígitos)"
    )
    .optional(),

  direccion: z.string().min(4, "La dirección es obligatoria"),

  identificacion: z
    .string()
    .regex(/^(V|J)-\d{6,10}$/, "Identificación inválida"),

  email: z.string().email("Correo inválido"),
});
