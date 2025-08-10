"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteSchema = void 0;
const zod_1 = require("zod");
exports.ClienteSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: zod_1.z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    tipo: zod_1.z.enum(["NATURAL", "EMPRESA"], {
        errorMap: () => ({ message: "Tipo de cliente inválido" }),
    }),
    telefono: zod_1.z
        .string()
        .min(6, "El teléfono debe tener al menos 6 caracteres")
        .max(20, "El teléfono no puede exceder los 20 caracteres")
        .regex(/^[0-9()+\-.\s]+$/, "Formato de teléfono inválido"),
    telefono_secundario: zod_1.z.string().nullable().optional(),
    direccion: zod_1.z.string().min(4, "La dirección debe tener al menos 4 caracteres"),
    identificacion: zod_1.z
        .string()
        .regex(/^(V|J|E)-\d{6,10}$/, "Formato de identificación inválido (Ej: V-12345678)"),
    email: zod_1.z.string().email("Formato de correo inválido").nullable().optional(),
});
//# sourceMappingURL=cliente.schema.js.map