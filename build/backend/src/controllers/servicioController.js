"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllServicios = getAllServicios;
exports.getServicioById = getServicioById;
exports.createServicio = createServicio;
exports.updateServicio = updateServicio;
exports.deleteServicio = deleteServicio;
const client_1 = require("@prisma/client");
const servicio_schema_1 = require("../schemas/servicio.schema");
const prisma = new client_1.PrismaClient();
async function getAllServicios(req, res) {
    try {
        const servicios = await prisma.servicio.findMany();
        return res.json(servicios);
    }
    catch (error) {
        console.error("Error al obtener servicios:", error);
        return res.status(500).json({ message: "Error al obtener servicios" });
    }
}
async function getServicioById(req, res) {
    const { id } = req.params;
    try {
        const servicio = await prisma.servicio.findUnique({
            where: { id: Number(id) },
        });
        if (!servicio) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }
        return res.json(servicio);
    }
    catch (error) {
        console.error("Error al obtener servicio:", error);
        return res.status(500).json({ message: "Error al obtener servicio" });
    }
}
async function createServicio(req, res) {
    const result = servicio_schema_1.ServicioSchema.safeParse(req.body);
    if (!result.success) {
        return res
            .status(400)
            .json({ error: "Datos inválidos", detalles: result.error.format() });
    }
    try {
        const servicio = await prisma.servicio.create({ data: result.data });
        return res.status(201).json(servicio);
    }
    catch (error) {
        console.error("Error al crear servicio:", error);
        return res.status(500).json({ message: "Error al crear servicio" });
    }
}
async function updateServicio(req, res) {
    const { id } = req.params;
    const result = servicio_schema_1.ServicioSchema.safeParse(req.body);
    if (!result.success) {
        return res
            .status(400)
            .json({ error: "Datos inválidos", detalles: result.error.format() });
    }
    try {
        const servicio = await prisma.servicio.update({
            where: { id: Number(id) },
            data: result.data,
        });
        return res.json(servicio);
    }
    catch (error) {
        console.error("Error al actualizar servicio:", error);
        return res.status(500).json({ message: "Error al actualizar servicio" });
    }
}
async function deleteServicio(req, res) {
    const { id } = req.params;
    try {
        const existente = await prisma.servicio.findUnique({
            where: { id: Number(id) },
        });
        if (!existente) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }
        await prisma.servicio.delete({ where: { id: Number(id) } });
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error al eliminar servicio:", error);
        return res.status(500).json({ message: "Error al eliminar servicio" });
    }
}
//# sourceMappingURL=servicioController.js.map