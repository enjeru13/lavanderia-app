import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllDetalle(req: Request, res: Response) {
  const detalles = await prisma.detalleOrden.findMany();
  res.json(detalles);
}

export async function getDetalleById(req: Request, res: Response) {
  const { id } = req.params;
  const detalle = await prisma.detalleOrden.findUnique({
    where: { id: Number(id) },
  });
  res.json(detalle);
}

export async function createDetalle(req: Request, res: Response) {
  const detalle = await prisma.detalleOrden.create({ data: req.body });
  res.status(201).json(detalle);
}

export async function updateDetalle(req: Request, res: Response) {
  const { id } = req.params;
  const detalle = await prisma.detalleOrden.update({
    where: { id: Number(id) },
    data: req.body,
  });
  res.json(detalle);
}

export async function deleteDetalle(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.detalleOrden.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
