import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllPagos(req: Request, res: Response) {
  const pagos = await prisma.pago.findMany();
  res.json(pagos);
}

export async function getPagoById(req: Request, res: Response) {
  const { id } = req.params;
  const pago = await prisma.pago.findUnique({
    where: { id: Number(id) },
  });
  res.json(pago);
}

export async function createPago(req: Request, res: Response) {
  const pago = await prisma.pago.create({ data: req.body });
  res.status(201).json(pago);
}

export async function updatePago(req: Request, res: Response) {
  const { id } = req.params;
  const pago = await prisma.pago.update({
    where: { id: Number(id) },
    data: req.body,
  });
  res.json(pago);
}

export async function deletePago(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.pago.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
