"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionSchema = exports.MonedaSchema = void 0;
const zod_1 = require("zod");
exports.MonedaSchema = zod_1.z.enum(["USD", "VES", "COP"]);
const parseTasa = zod_1.z
    .union([zod_1.z.string(), zod_1.z.number(), zod_1.z.null(), zod_1.z.undefined()])
    .transform((val) => {
    if (val === null || val === undefined)
        return null;
    if (typeof val === "string") {
        const limpio = val.replace(",", ".").replace(/\s/g, "");
        const num = Number(limpio);
        return isNaN(num) ? null : num;
    }
    return typeof val === "number" ? val : null;
})
    .nullable();
exports.ConfiguracionSchema = zod_1.z.object({
    nombreNegocio: zod_1.z.string().min(1, "Debes indicar el nombre del negocio"),
    monedaPrincipal: exports.MonedaSchema,
    tasaUSD: zod_1.z.number().nullable().default(1),
    tasaVES: parseTasa,
    tasaCOP: parseTasa,
    rif: zod_1.z.string().nullable().optional(),
    direccion: zod_1.z.string().nullable().optional(),
    telefonoPrincipal: zod_1.z.string().nullable().optional(),
    telefonoSecundario: zod_1.z.string().nullable().optional(),
    mensajePieRecibo: zod_1.z.string().nullable().optional(),
});
//# sourceMappingURL=configuracion.schema.js.map