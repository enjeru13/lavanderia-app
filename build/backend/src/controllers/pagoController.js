"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPagos = getAllPagos;
exports.getPagoById = getPagoById;
exports.createPago = createPago;
exports.updatePago = updatePago;
exports.deletePago = deletePago;
const prisma_1 = __importDefault(require("../lib/prisma"));
const pago_schema_1 = require("../schemas/pago.schema");
const library_1 = require("@prisma/client/runtime/library");
const pagoFinance_1 = require("../../../shared/utils/pagoFinance");
async function recalcularEstadoOrden(ordenId) {
    const orden = await prisma_1.default.orden.findUnique({
        where: { id: ordenId },
        include: { pagos: true },
    });
    if (!orden) {
        console.warn(`Orden con ID ${ordenId} no encontrada para recalcular estado.`);
        throw new Error(`Orden con ID ${ordenId} no encontrada para recalcular estado.`);
    }
    const config = await prisma_1.default.configuracion.findFirst();
    const principalMoneda = (config?.monedaPrincipal || "USD");
    const tasas = {
        VES: config?.tasaVES ?? null,
        COP: config?.tasaCOP ?? null,
    };
    console.log("DEBUG BACKEND: Recalculando estado para Orden ID:", ordenId);
    console.log("DEBUG BACKEND: Moneda Principal:", principalMoneda);
    console.log("DEBUG BACKEND: Tasas de Conversión:", tasas);
    console.log("DEBUG BACKEND: Pagos de la orden:", orden.pagos);
    console.log("DEBUG BACKEND: Total de la orden:", orden.total);
    const resumen = (0, pagoFinance_1.calcularResumenPago)({ total: orden.total, pagos: orden.pagos }, tasas, principalMoneda);
    console.log("DEBUG BACKEND: Resumen calculado (abonado, faltante, estadoRaw):", resumen);
    await prisma_1.default.orden.update({
        where: { id: ordenId },
        data: {
            abonado: resumen.abonado,
            faltante: resumen.faltante,
            estadoPago: resumen.estadoRaw,
        },
    });
}
async function getAllPagos(req, res) {
    try {
        const pagos = await prisma_1.default.pago.findMany({
            include: {
                orden: {
                    include: {
                        cliente: true,
                    },
                },
                vueltos: true,
            },
            orderBy: { fechaPago: "desc" },
        });
        return res.json(pagos);
    }
    catch (error) {
        console.error("Error al obtener pagos:", error);
        return res.status(500).json({ message: "Error al obtener pagos" });
    }
}
async function getPagoById(req, res) {
    const { id } = req.params;
    try {
        const pago = await prisma_1.default.pago.findUnique({
            where: { id: Number(id) },
            include: {
                orden: {
                    include: {
                        cliente: true,
                    },
                },
                vueltos: true,
            },
        });
        if (!pago) {
            return res.status(404).json({ message: "Pago no encontrado" });
        }
        return res.json(pago);
    }
    catch (error) {
        console.error("Error al obtener pago por ID:", error);
        return res.status(500).json({ message: "Error al obtener pago por ID" });
    }
}
async function createPago(req, res) {
    const result = pago_schema_1.PagoSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Datos inválidos",
            detalles: result.error.format(),
        });
    }
    const { ordenId, monto, metodoPago, moneda, nota, vueltos = [], } = result.data;
    try {
        const ordenExistente = await prisma_1.default.orden.findUnique({
            where: { id: ordenId },
        });
        if (!ordenExistente) {
            return res
                .status(404)
                .json({ message: `Orden con ID ${ordenId} no encontrada.` });
        }
        const nuevoPago = await prisma_1.default.pago.create({
            data: {
                ordenId,
                monto,
                moneda,
                metodoPago,
                nota: nota ?? null,
            },
        });
        if (vueltos.length > 0) {
            const vueltosValidos = vueltos.map((v) => ({
                pagoId: nuevoPago.id,
                monto: v.monto,
                moneda: v.moneda,
            }));
            await prisma_1.default.vueltoEntregado.createMany({ data: vueltosValidos });
        }
        await recalcularEstadoOrden(ordenId);
        const pagoConOrden = await prisma_1.default.pago.findUnique({
            where: { id: nuevoPago.id },
            include: {
                orden: {
                    include: {
                        cliente: true,
                    },
                },
                vueltos: true,
            },
        });
        return res.status(201).json(pagoConOrden);
    }
    catch (error) {
        console.error("Error al crear pago:", error);
        return res.status(500).json({ message: "Error al crear pago" });
    }
}
async function updatePago(req, res) {
    const { id } = req.params;
    const result = pago_schema_1.PagoSchema.partial().safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Datos inválidos para actualizar pago",
            detalles: result.error.format(),
        });
    }
    const { ordenId, vueltos, ...rest } = result.data;
    try {
        const pagoExistente = await prisma_1.default.pago.findUnique({
            where: { id: Number(id) },
            select: { ordenId: true },
        });
        if (!pagoExistente) {
            return res
                .status(404)
                .json({ message: "Pago no encontrado para actualizar." });
        }
        const pagoActualizado = await prisma_1.default.pago.update({
            where: { id: Number(id) },
            data: rest,
        });
        if (vueltos !== undefined) {
            await prisma_1.default.vueltoEntregado.deleteMany({
                where: { pagoId: pagoActualizado.id },
            });
            if (vueltos.length > 0) {
                await prisma_1.default.vueltoEntregado.createMany({
                    data: vueltos.map((v) => ({ ...v, pagoId: pagoActualizado.id })),
                });
            }
        }
        await recalcularEstadoOrden(pagoExistente.ordenId);
        const pagoConOrden = await prisma_1.default.pago.findUnique({
            where: { id: pagoActualizado.id },
            include: {
                orden: {
                    include: {
                        cliente: true,
                    },
                },
                vueltos: true,
            },
        });
        return res.json(pagoConOrden);
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res
                    .status(404)
                    .json({ message: "Pago no encontrado para actualizar." });
            }
        }
        console.error("Error al actualizar pago:", error);
        return res.status(500).json({ message: "Error al actualizar pago" });
    }
}
async function deletePago(req, res) {
    const { id } = req.params;
    try {
        const pagoExistente = await prisma_1.default.pago.findUnique({
            where: { id: Number(id) },
            select: { ordenId: true },
        });
        if (!pagoExistente) {
            return res
                .status(404)
                .json({ message: "Pago no encontrado para eliminar." });
        }
        await prisma_1.default.vueltoEntregado.deleteMany({ where: { pagoId: Number(id) } });
        await prisma_1.default.pago.delete({ where: { id: Number(id) } });
        await recalcularEstadoOrden(pagoExistente.ordenId);
        return res.status(204).send();
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res
                    .status(404)
                    .json({ message: "Pago no encontrado para eliminar." });
            }
        }
        console.error("Error al eliminar pago:", error);
        return res.status(500).json({ message: "Error al eliminar pago" });
    }
}
//# sourceMappingURL=pagoController.js.map