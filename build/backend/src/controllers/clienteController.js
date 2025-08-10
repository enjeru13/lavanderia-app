"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClientes = getAllClientes;
exports.getClienteById = getClienteById;
exports.createCliente = createCliente;
exports.updateCliente = updateCliente;
exports.deleteCliente = deleteCliente;
const prisma_1 = __importDefault(require("../lib/prisma"));
const cliente_schema_1 = require("../schemas/cliente.schema");
const library_1 = require("@prisma/client/runtime/library");
async function getAllClientes(req, res) {
    try {
        const clientes = await prisma_1.default.cliente.findMany();
        return res.json(clientes);
    }
    catch (error) {
        console.error("Error al obtener clientes:", error);
        return res.status(500).json({ message: "Error al obtener clientes" });
    }
}
async function getClienteById(req, res) {
    const { id } = req.params;
    try {
        const cliente = await prisma_1.default.cliente.findUnique({
            where: { id: Number(id) },
        });
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        return res.json(cliente);
    }
    catch (error) {
        console.error("Error al obtener cliente:", error);
        return res.status(500).json({ message: "Error al obtener cliente" });
    }
}
async function createCliente(req, res) {
    const result = cliente_schema_1.ClienteSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Validación fallida",
            detalles: result.error.format(),
        });
    }
    try {
        const cliente = await prisma_1.default.cliente.create({
            data: result.data,
        });
        return res.status(201).json(cliente);
    }
    catch (error) {
        console.error("Error al crear cliente:", error);
        return res.status(500).json({ message: "Error al crear cliente" });
    }
}
async function updateCliente(req, res) {
    const { id } = req.params;
    const partialClienteSchema = cliente_schema_1.ClienteSchema.partial();
    const result = partialClienteSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Validación fallida",
            detalles: result.error.format(),
        });
    }
    try {
        const cliente = await prisma_1.default.cliente.update({
            where: { id: Number(id) },
            data: result.data,
        });
        return res.json(cliente);
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res
                    .status(404)
                    .json({ message: "Cliente no encontrado para actualizar." });
            }
        }
        console.error("Error al actualizar cliente:", error);
        return res.status(500).json({ message: "Error al actualizar cliente" });
    }
}
async function deleteCliente(req, res) {
    const { id } = req.params;
    try {
        const existente = await prisma_1.default.cliente.findUnique({
            where: { id: Number(id) },
        });
        if (!existente) {
            return res
                .status(404)
                .json({ message: "Cliente no encontrado para eliminar." });
        }
        await prisma_1.default.cliente.delete({ where: { id: Number(id) } });
        return res.status(204).send();
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res
                    .status(404)
                    .json({ message: "Cliente no encontrado para eliminar." });
            }
        }
        console.error("Error al eliminar cliente:", error);
        return res.status(500).json({ message: "Error al eliminar cliente" });
    }
}
//# sourceMappingURL=clienteController.js.map