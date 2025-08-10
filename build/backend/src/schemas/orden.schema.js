"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservacionUpdateSchema = exports.ordenUpdateSchema = exports.ordenSchema = void 0;
const zod_1 = require("zod");
const fechaTransformada = zod_1.z
    .union([zod_1.z.string(), zod_1.z.null(), zod_1.z.undefined()])
    .optional()
    .transform((val) => {
    if (val === null || val === undefined || val === "")
        return null;
    const timestamp = Date.parse(val);
    return isNaN(timestamp) ? null : new Date(timestamp);
})
    .refine((val) => val === null || val instanceof Date, {
    message: "Fecha inválida",
});
exports.ordenSchema = zod_1.z.object({
    clienteId: zod_1.z.number().int().positive("ID de cliente inválido"),
    estado: zod_1.z.enum(["PENDIENTE", "ENTREGADO"], {
        errorMap: () => ({ message: "Estado de orden inválido" }),
    }),
    observaciones: zod_1.z.string().nullable().optional(),
    fechaEntrega: fechaTransformada,
    servicios: zod_1.z
        .array(zod_1.z.object({
        servicioId: zod_1.z.number().int().positive("ID de servicio inválido"),
        cantidad: zod_1.z
            .union([zod_1.z.number(), zod_1.z.string()])
            .transform((val) => typeof val === "string"
            ? Number(val.replace(",", ".").replace(/\s/g, ""))
            : val)
            .refine((n) => n > 0 && !isNaN(n), {
            message: "La cantidad debe ser un número válido mayor que 0",
        }),
    }))
        .min(1, "Debes agregar al menos un servicio a la orden"),
});
exports.ordenUpdateSchema = exports.ordenSchema.partial();
exports.ObservacionUpdateSchema = zod_1.z.object({
    observaciones: zod_1.z.string().nullable().optional(),
});
//# sourceMappingURL=orden.schema.js.map