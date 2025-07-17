import { z } from "zod";

export const ClienteSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo letras permitidas"),

  apellido: z
    .string()
    .trim()
    .min(2, "El apellido es obligatorio")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo letras permitidas"),

  tipo: z.enum(["NATURAL", "EMPRESA"], {
    errorMap: () => ({ message: "Tipo de cliente inválido" }),
  }),

  telefono: z
    .string()
    .trim()
    .regex(
      /^[0-9()+\-.\s]{6,20}$/,
      "Formato inválido (solo números y símbolos)"
    ),

  telefono_secundario: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[0-9()+\-.\s]{6,20}$/.test(val), {
      message: "Formato inválido en teléfono secundario",
    }),

  direccion: z.string().trim().min(4, "La dirección es obligatoria"),

  identificacion: z
    .string()
    .regex(/^(V|J|E)-\d{6,10}$/, "Identificación inválida"),

  email: z.string().trim().email("Correo inválido").optional(),
});
