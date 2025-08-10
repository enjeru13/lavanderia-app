"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagoSchema = exports.VueltoSchema = exports.MonedaSchema = exports.MetodoPagoSchema = void 0;
const zod_1 = require("zod");
exports.MetodoPagoSchema = zod_1.z.enum([
    "EFECTIVO",
    "TRANSFERENCIA",
    "PAGO_MOVIL",
]);
exports.MonedaSchema = zod_1.z.enum(["USD", "VES", "COP"]);
exports.VueltoSchema = zod_1.z.object({
    monto: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => typeof val === "string"
        ? Number(val.replace(",", ".").replace(/\s/g, ""))
        : val)
        .refine((n) => !isNaN(n) && n > 0, {
        message: "El monto del vuelto debe ser positivo",
    }),
    moneda: exports.MonedaSchema,
});
exports.PagoSchema = zod_1.z.object({
    ordenId: zod_1.z.number().int().positive("ID de orden inválido"),
    monto: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => typeof val === "string"
        ? Number(val.replace(",", ".").replace(/\s/g, ""))
        : val)
        .refine((n) => !isNaN(n) && n > 0, {
        message: "El monto debe ser un número positivo",
    }),
    moneda: exports.MonedaSchema,
    metodoPago: exports.MetodoPagoSchema,
    nota: zod_1.z.string().nullable().optional(),
    vueltos: zod_1.z.array(exports.VueltoSchema).optional(),
});
//# sourceMappingURL=pago.schema.js.map