import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllServicios(req: Request, res: Response) {
  const servicios = await prisma.servicio.findMany();
  res.json(servicios);
}

export async function getServicioById(req: Request, res: Response) {
  const { id } = req.params;
  const servicio = await prisma.servicio.findUnique({
    where: { id: Number(id) },
  });
  res.json(servicio);
}

export async function createServicio(req: Request, res: Response) {
  const servicio = await prisma.servicio.create({ data: req.body });
  res.status(201).json(servicio);
}

export async function updateServicio(req: Request, res: Response) {
  const { id } = req.params;
  const servicio = await prisma.servicio.update({
    where: { id: Number(id) },
    data: req.body,
  });
  res.json(servicio);
}

export async function deleteServicio(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.servicio.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
