import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ClienteSchema } from "../schemas/cliente.schema";

const prisma = new PrismaClient();

export async function getAllClientes(req: Request, res: Response) {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
}

export async function getClienteById(req: Request, res: Response) {
  const { id } = req.params;
  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(id) },
  });
  res.json(cliente);
}

export async function createCliente(req: Request, res: Response) {
  const result = ClienteSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Validación fallida",
      detalles: result.error.format(),
    });
    return;
  }

  try {
    const cliente = await prisma.cliente.create({
      data: result.data,
    });
    res.status(201).json(cliente);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ message: "Error al crear cliente" });
  }
}

export async function updateCliente(req: Request, res: Response) {
  const { id } = req.params;
  const result = ClienteSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validación fallida",
      detalles: result.error.format(),
    });
  }

  try {
    const cliente = await prisma.cliente.update({
      where: { id: Number(id) },
      data: result.data,
    });
    return res.json(cliente);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return res.status(500).json({ message: "Error al actualizar cliente" });
  }
}

export async function deleteCliente(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.cliente.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
}
