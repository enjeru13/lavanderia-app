import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ordenSchema, ordenUpdateSchema } from "../schemas/orden.schema";

const prisma = new PrismaClient();

// ✅ Obtener todas las órdenes
export async function getAllOrdenes(req: Request, res: Response) {
  try {
    const ordenes = await prisma.orden.findMany({
      include: {
        cliente: true,
        detalles: { include: { servicio: true } },
        pagos: true,
      },
      orderBy: { fechaIngreso: "desc" },
    });
    res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error al obtener órdenes" });
  }
}

// ✅ Obtener una orden por ID
export async function getOrdenById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const orden = await prisma.orden.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: true,
        detalles: { include: { servicio: true } },
        pagos: true,
      },
    });

    if (!orden) return res.status(404).json({ message: "Orden no encontrada" });

    return res.json(orden);
  } catch (error) {
    console.error("Error al obtener orden:", error);
    return res.status(500).json({ message: "Error al obtener orden" });
  }
}

// ✅ Crear una nueva orden (fechaEntrega opcional)
export async function createOrden(req: Request, res: Response) {
  const result = ordenSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validación fallida",
      detalles: result.error.format(),
    });
  }

  const { cliente_id, estado, observaciones, servicios, fechaEntrega } =
    result.data;

  try {
    let total = 0;
    const detalleData = [];

    for (const item of servicios) {
      const servicio = await prisma.servicio.findUnique({
        where: { id: item.servicioId },
      });

      if (!servicio) continue;

      const precioUnit = servicio.precioBase;
      const subtotal = precioUnit * item.cantidad;

      detalleData.push({
        servicioId: item.servicioId,
        cantidad: item.cantidad,
        precioUnit,
        subtotal,
      });

      total += subtotal;
    }

    const orden = await prisma.orden.create({
      data: {
        clienteId: cliente_id,
        estado,
        total,
        observaciones,
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null, // ✅ opcional
        detalles: { create: detalleData },
      },
      include: {
        cliente: true,
        detalles: { include: { servicio: true } },
      },
    });

    return res.status(201).json(orden);
  } catch (error) {
    console.error("Error al crear orden:", error);
    return res.status(500).json({ message: "Error al crear orden" });
  }
}

// ✅ Actualizar una orden existente (fechaEntrega opcional)
export async function updateOrden(req: Request, res: Response) {
  const { id } = req.params;
  const result = ordenUpdateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validación fallida",
      detalles: result.error.format(),
    });
  }

  const updateData = { ...result.data };

  // Manejar fechaEntrega opcional correctamente
  if ("fechaEntrega" in updateData) {
    if (updateData.fechaEntrega) {
      (updateData as any).fechaEntrega = new Date(updateData.fechaEntrega);
    } else {
      (updateData as any).fechaEntrega = null;
    }
  }

  try {
    const orden = await prisma.orden.update({
      where: { id: Number(id) },
      data: updateData,
    });
    return res.json(orden);
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    return res.status(500).json({ message: "Error al actualizar orden" });
  }
}

// ✅ Eliminar una orden y sus detalles
export async function deleteOrden(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.detalleOrden.deleteMany({ where: { ordenId: Number(id) } });
    await prisma.pago.deleteMany({ where: { ordenId: Number(id) } });
    await prisma.orden.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar orden:", error);
    res.status(500).json({ message: "Error al eliminar orden" });
  }
}
