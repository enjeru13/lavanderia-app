"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDetalle = getAllDetalle;
exports.getDetallesByOrdenId = getDetallesByOrdenId;
exports.getDetalleById = getDetalleById;
exports.createDetalle = createDetalle;
exports.updateDetalle = updateDetalle;
exports.deleteDetalle = deleteDetalle;
const prisma_1 = __importDefault(require("../lib/prisma"));
const detalleOrden_schema_1 = require("../schemas/detalleOrden.schema");
const library_1 = require("@prisma/client/runtime/library");
async function getAllDetalle(req, res) {
    try {
        const detalles = await prisma_1.default.detalleOrden.findMany();
        return res.json(detalles);
    }
    catch (error) {
        console.error("Error al obtener todos los detalles:", error);
        return res
            .status(500)
            .json({ message: "Error al obtener todos los detalles" });
    }
}
async function getDetallesByOrdenId(req, res) {
    const { ordenId } = req.query;
    if (!ordenId) {
        return res.status(400).json({
            message: "Se requiere un 'ordenId' como parámetro de consulta.",
        });
    }
    const parsedOrdenId = Number(ordenId);
    if (isNaN(parsedOrdenId)) {
        return res
            .status(400)
            .json({ message: "El 'ordenId' debe ser un número válido." });
    }
    try {
        const detalles = await prisma_1.default.detalleOrden.findMany({
            where: { ordenId: parsedOrdenId },
            include: {
                servicio: true,
            },
        });
        return res.json(detalles);
    }
    catch (error) {
        console.error(`Error al obtener detalles para la orden ${ordenId}:`, error);
        return res
            .status(500)
            .json({ message: `Error al obtener detalles para la orden ${ordenId}` });
    }
}
async function getDetalleById(req, res) {
    const { id } = req.params;
    try {
        const detalle = await prisma_1.default.detalleOrden.findUnique({
            where: { id: Number(id) },
        });
        if (!detalle) {
            return res.status(404).json({ message: "Detalle no encontrado" });
        }
        return res.json(detalle);
    }
    catch (error) {
        console.error("Error al obtener detalle por ID:", error);
        return res.status(500).json({ message: "Error al obtener detalle por ID" });
    }
}
async function createDetalle(req, res) {
    const result = detalleOrden_schema_1.DetalleOrdenSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Datos inválidos",
            detalles: result.error.format(),
        });
    }
    try {
        const detalle = await prisma_1.default.detalleOrden.create({ data: result.data });
        return res.status(201).json(detalle);
    }
    catch (error) {
        console.error("Error al crear detalle:", error);
        return res.status(500).json({ message: "Error al crear detalle" });
    }
}
async function updateDetalle(req, res) {
    const { id } = req.params;
    const result = detalleOrden_schema_1.DetalleOrdenSchema.partial().safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Datos inválidos",
            detalles: result.error.format(),
        });
    }
    try {
        const detalle = await prisma_1.default.detalleOrden.update({
            where: { id: Number(id) },
            data: result.data,
        });
        return res.json(detalle);
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res
                    .status(404)
                    .json({ message: "Detalle de orden no encontrado para actualizar." });
            }
        }
        console.error("Error al actualizar detalle:", error);
        return res.status(500).json({ message: "Error al actualizar detalle" });
    }
}
async function deleteDetalle(req, res) {
    const { id } = req.params;
    try {
        const existente = await prisma_1.default.detalleOrden.findUnique({
            where: { id: Number(id) },
        });
        if (!existente) {
            return res
                .status(404)
                .json({ message: "Detalle no encontrado para eliminar." });
        }
        await prisma_1.default.detalleOrden.delete({ where: { id: Number(id) } });
        return res.status(204).send();
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res
                    .status(404)
                    .json({ message: "Detalle de orden no encontrado para eliminar." });
            }
        }
        console.error("Error al eliminar detalle:", error);
        return res.status(500).json({ message: "Error al eliminar detalle" });
    }
}
//# sourceMappingURL=detalleOrdenController.js.map