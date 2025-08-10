"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguracion = getConfiguracion;
exports.updateConfiguracion = updateConfiguracion;
const prisma_1 = __importDefault(require("../lib/prisma"));
const configuracion_schema_1 = require("../schemas/configuracion.schema");
async function getConfiguracion(req, res) {
    try {
        let config = await prisma_1.default.configuracion.findFirst();
        if (!config) {
            config = await prisma_1.default.configuracion.create({
                data: {
                    nombreNegocio: "Mi negocio",
                    monedaPrincipal: "USD",
                    tasaUSD: 1,
                    tasaVES: null,
                    tasaCOP: null,
                    rif: "",
                    direccion: "",
                    telefonoPrincipal: "",
                    telefonoSecundario: "",
                    mensajePieRecibo: "",
                },
            });
        }
        return res.json(config);
    }
    catch (error) {
        console.error("Error al obtener configuración:", error);
        return res.status(500).json({ message: "Error al obtener configuración" });
    }
}
async function updateConfiguracion(req, res) {
    const result = configuracion_schema_1.ConfiguracionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Datos inválidos",
            detalles: result.error.format(),
        });
    }
    const data = result.data;
    try {
        const config = await prisma_1.default.configuracion.findFirst();
        if (!config) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }
        const actualizada = await prisma_1.default.configuracion.update({
            where: { id: config.id },
            data: {
                ...data,
                tasaUSD: 1,
            },
        });
        return res.json(actualizada);
    }
    catch (error) {
        console.error("Error al actualizar configuración:", error);
        return res
            .status(500)
            .json({ message: "Error al actualizar configuración" });
    }
}
//# sourceMappingURL=configuracionesController.js.map