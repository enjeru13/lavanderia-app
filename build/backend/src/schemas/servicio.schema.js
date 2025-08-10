"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicioSchema = void 0;
const zod_1 = require("zod");
exports.ServicioSchema = zod_1.z.object({
    nombreServicio: zod_1.z.string().min(1, "El nombre del servicio es requerido"),
    precioBase: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => typeof val === "string"
        ? Number(val.replace(",", ".").replace(/\s/g, ""))
        : val)
        .refine((n) => !isNaN(n) && n >= 0, {
        message: "El precio debe ser un número válido mayor o igual a cero",
    }),
    descripcion: zod_1.z.string().nullable().optional(),
    permiteDecimales: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=servicio.schema.js.map