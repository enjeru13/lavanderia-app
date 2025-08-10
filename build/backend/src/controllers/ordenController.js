"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrdenes = getAllOrdenes;
exports.getOrdenById = getOrdenById;
exports.createOrden = createOrden;
exports.updateOrden = updateOrden;
exports.deleteOrden = deleteOrden;
exports.actualizarObservacion = actualizarObservacion;
const prisma_1 = __importDefault(require("../lib/prisma"));
const orden_schema_1 = require("../schemas/orden.schema");
const library_1 = require("@prisma/client/runtime/library");
async function getAllOrdenes(req, res) {
    try {
        const ordenes = await prisma_1.default.orden.findMany({
            include: {
                cliente: true,
                detalles: { include: { servicio: true } },
                pagos: true,
            },
            orderBy: { fechaIngreso: "desc" },
        });
        return res.json(ordenes);
    }
    catch (error) {
        console.error("Error al obtener órdenes:", error);
        return res.status(500).json({ message: "Error al obtener órdenes" });
    }
}
async function getOrdenById(req, res) {
    const { id } = req.params;
    try {
        const orden = await prisma_1.default.orden.findUnique({
            where: { id: Number(id) },
            include: {
                cliente: true,
                detalles: { include: { servicio: true } },
                pagos: true,
            },
        });
        if (!orden) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        return res.json(orden);
    }
    catch (error) {
        console.error("Error al obtener orden:", error);
        return res.status(500).json({ message: "Error al obtener orden" });
    }
}
async function createOrden(req, res) {
    const result = orden_schema_1.ordenSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Validación fallida",
            detalles: result.error.format(),
        });
    }
    const { clienteId, estado, observaciones, servicios, fechaEntrega } = result.data;
    try {
        let total = 0;
        const detalleData = [];
        for (const item of servicios) {
            const servicio = await prisma_1.default.servicio.findUnique({
                where: { id: item.servicioId },
            });
            if (!servicio) {
                return res.status(400).json({
                    message: `Servicio con ID ${item.servicioId} no encontrado.`,
                });
            }
            const precioUnit = servicio.precioBase;
            const subtotal = precioUnit * item.cantidad;
            detalleData.push({
                servicioId: item.servicioId,
                cantidad: item.cantidad,
                precioUnit,
                subtotal: parseFloat(subtotal.toFixed(2)),
            });
            total += subtotal;
        }
        const orden = await prisma_1.default.orden.create({
            data: {
                clienteId: clienteId,
                estado,
                total: parseFloat(total.toFixed(2)),
                observaciones,
                fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
                abonado: 0,
                faltante: parseFloat(total.toFixed(2)),
                estadoPago: "INCOMPLETO",
                detalles: { create: detalleData },
            },
            include: {
                cliente: true,
                detalles: { include: { servicio: true } },
            },
        });
        return res.status(201).json(orden);
    }
    catch (error) {
        console.error("Error al crear orden:", error);
        return res.status(500).json({ message: "Error al crear orden" });
    }
}
async function updateOrden(req, res) {
    const { id } = req.params;
    const result = orden_schema_1.ordenUpdateSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Validación fallida",
            detalles: result.error.format(),
        });
    }
    const { fechaEntrega, estado, ...rest } = result.data;
    try {
        const ordenActual = await prisma_1.default.orden.findUnique({
            where: { id: Number(id) },
            select: { fechaIngreso: true, fechaEntrega: true },
        });
        if (!ordenActual) {
            return res
                .status(404)
                .json({ message: "Orden no encontrada para actualizar." });
        }
        let fechaFinalEntrega = ordenActual.fechaEntrega || null;
        if (fechaEntrega !== undefined) {
            fechaFinalEntrega = fechaEntrega === null ? null : new Date(fechaEntrega);
        }
        if (estado === "ENTREGADO") {
            const mismoDia = ordenActual.fechaEntrega &&
                ordenActual.fechaEntrega.toISOString().split("T")[0] ===
                    ordenActual.fechaIngreso.toISOString().split("T")[0];
            const seDebeActualizar = !ordenActual.fechaEntrega || mismoDia;
            if (fechaEntrega === undefined && seDebeActualizar) {
                fechaFinalEntrega = new Date();
            }
        }
        const datosParaGuardar = {
            ...rest,
            ...(estado !== undefined && { estado }),
            ...(fechaFinalEntrega !== undefined && {
                fechaEntrega: fechaFinalEntrega,
            }),
        };
        await prisma_1.default.orden.update({
            where: { id: Number(id) },
            data: datosParaGuardar,
        });
        const ordenActualizada = await prisma_1.default.orden.findUnique({
            where: { id: Number(id) },
            include: {
                cliente: true,
                pagos: true,
                detalles: {
                    include: { servicio: true },
                },
            },
        });
        return res.json(ordenActualizada);
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res
                    .status(404)
                    .json({ message: "Orden no encontrada para actualizar." });
            }
        }
        console.error("Error al actualizar orden:", error);
        return res.status(500).json({ message: "Error al actualizar orden" });
    }
}
async function deleteOrden(req, res) {
    const { id } = req.params;
    try {
        const existente = await prisma_1.default.orden.findUnique({
            where: { id: Number(id) },
        });
        if (!existente) {
            return res
                .status(404)
                .json({ message: "Orden no encontrada para eliminar." });
        }
        await prisma_1.default.detalleOrden.deleteMany({ where: { ordenId: Number(id) } });
        await prisma_1.default.pago.deleteMany({ where: { ordenId: Number(id) } });
        await prisma_1.default.orden.delete({ where: { id: Number(id) } });
        return res.status(204).send();
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res
                    .status(404)
                    .json({ message: "Orden no encontrada para eliminar." });
            }
        }
        console.error("Error al eliminar orden:", error);
        return res.status(500).json({ message: "Error al eliminar orden" });
    }
}
async function actualizarObservacion(req, res) {
    const { id } = req.params;
    const result = orden_schema_1.ObservacionUpdateSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Validación fallida",
            detalles: result.error.format(),
        });
    }
    const { observaciones } = result.data;
    try {
        await prisma_1.default.orden.update({
            where: { id: Number(id) },
            data: { observaciones },
        });
        const actualizada = await prisma_1.default.orden.findUnique({
            where: { id: Number(id) },
            include: {
                cliente: true,
                pagos: true,
                detalles: true,
            },
        });
        if (!actualizada) {
            return res.status(404).json({
                message: "Orden no encontrada después de actualizar observaciones.",
            });
        }
        return res.status(200).json(actualizada);
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    message: "Orden no encontrada para actualizar observaciones.",
                });
            }
        }
        console.error("Error al actualizar observaciones:", error);
        return res
            .status(500)
            .json({ message: "Error al actualizar observaciones" });
    }
}
//# sourceMappingURL=ordenController.js.map