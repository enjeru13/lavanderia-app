import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllOrdenes(req: Request, res: Response) {
  const ordenes = await prisma.orden.findMany({
    include: { cliente: true, detalles: true, pagos: true },
  });
  res.json(ordenes);
}

export async function getOrdenById(req: Request, res: Response) {
  const { id } = req.params;
  const orden = await prisma.orden.findUnique({
    where: { id: Number(id) },
    include: { cliente: true, detalles: true, pagos: true },
  });
  res.json(orden);
}

export async function createOrden(req: Request, res: Response) {
  const { clienteId, fechaEntrega, estado, total, observaciones } = req.body;
  const orden = await prisma.orden.create({
    data: { clienteId, fechaEntrega, estado, total, observaciones },
  });
  res.status(201).json(orden);
}

export async function updateOrden(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;
  const orden = await prisma.orden.update({
    where: { id: Number(id) },
    data,
  });
  res.json(orden);
}

export async function deleteOrden(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.orden.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
