import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ServicioSchema } from "../schemas/servicio.schema";

const prisma = new PrismaClient();

export async function getAllServicios(req: Request, res: Response) {
  try {
    const servicios = await prisma.servicio.findMany();
    res.json(servicios);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ message: "Error al obtener servicios" });
  }
}

export async function getServicioById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const servicio = await prisma.servicio.findUnique({
      where: { id: Number(id) },
    });

    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    return res.json(servicio);
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    return res.status(500).json({ message: "Error al obtener servicio" });
  }
}

export async function createServicio(req: Request, res: Response) {
  const result = ServicioSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ error: "Datos inválidos", detalles: result.error.format() });
  }

  try {
    const servicio = await prisma.servicio.create({ data: result.data });
    res.status(201).json(servicio);
    return;
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ message: "Error al crear servicio" });
    return;
  }
}

export async function updateServicio(req: Request, res: Response) {
  const { id } = req.params;
  const result = ServicioSchema.safeParse(req.body);

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

    res.json(servicio);
    return;
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ message: "Error al actualizar servicio" });
    return;
  }
}

export async function deleteServicio(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.servicio.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ message: "Error al eliminar servicio" });
  }
}
