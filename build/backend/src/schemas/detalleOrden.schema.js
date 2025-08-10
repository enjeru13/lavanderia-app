"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleOrdenSchema = void 0;
const zod_1 = require("zod");
exports.DetalleOrdenSchema = zod_1.z.object({
    ordenId: zod_1.z.number().int().positive({
        message: "El ordenId es obligatorio y debe ser un entero positivo",
    }),
    servicioId: zod_1.z.number().int().positive({
        message: "ID de servicio inválido",
    }),
    cantidad: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => typeof val === "string"
        ? Number(val.replace(",", ".").replace(/\s/g, ""))
        : val)
        .refine((n) => n > 0 && !isNaN(n), {
        message: "La cantidad debe ser mayor que 0",
    }),
    precioUnit: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => typeof val === "string"
        ? Number(val.replace(",", ".").replace(/\s/g, ""))
        : val)
        .refine((n) => n >= 0 && !isNaN(n), {
        message: "El precio unitario debe ser válido",
    }),
    subtotal: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => typeof val === "string"
        ? Number(val.replace(",", ".").replace(/\s/g, ""))
        : val)
        .refine((n) => n >= 0 && !isNaN(n), {
        message: "El subtotal debe ser válido",
    }),
});
//# sourceMappingURL=detalleOrden.schema.js.map