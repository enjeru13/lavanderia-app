import { Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  ordenSchema,
  ordenUpdateSchema,
  ObservacionUpdateSchema,
} from "../schemas/orden.schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import dayjs from "dayjs";


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
    return res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return res.status(500).json({ message: "Error al obtener órdenes" });
  }
}

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
    if (!orden) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    return res.json(orden);
  } catch (error) {
    console.error("Error al obtener orden:", error);
    return res.status(500).json({ message: "Error al obtener orden" });
  }
}

export async function createOrden(req: Request, res: Response) {
  const result = ordenSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validación fallida",
      detalles: result.error.format(),
    });
  }

  const { clienteId, estado, observaciones, servicios, fechaEntrega } =
    result.data;

  try {
    let total = 0;
    const detalleData: Array<{
      servicioId: number;
      cantidad: number;
      precioUnit: number;
      subtotal: number;
    }> = [];

    for (const item of servicios) {
      const servicio = await prisma.servicio.findUnique({
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

    const orden = await prisma.orden.create({
      data: {
        clienteId: clienteId,
        estado,
        total: parseFloat(total.toFixed(2)),
        observaciones,
        fechaEntrega: fechaEntrega ? dayjs(fechaEntrega).toDate() : null,
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
  } catch (error) {
    console.error("Error al crear orden:", error);
    return res.status(500).json({ message: "Error al crear orden" });
  }
}

export async function updateOrden(req: Request, res: Response) {
  const { id } = req.params;
  const result = ordenUpdateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validación fallida",
      detalles: result.error.format(),
    });
  }

  const { fechaEntrega, estado, ...rest } = result.data;

  try {
    const ordenActual = await prisma.orden.findUnique({
      where: { id: Number(id) },
      select: { fechaIngreso: true, fechaEntrega: true },
    });

    if (!ordenActual) {
      return res
        .status(404)
        .json({ message: "Orden no encontrada para actualizar." });
    }

    let fechaFinalEntrega: Date | null = ordenActual.fechaEntrega || null;

    if (fechaEntrega !== undefined) {
      fechaFinalEntrega = fechaEntrega === null ? null : dayjs(fechaEntrega).toDate();
    }

    if (estado === "ENTREGADO") {
      const mismoDia =
        ordenActual.fechaEntrega &&
        ordenActual.fechaEntrega.toISOString().split("T")[0] ===
          ordenActual.fechaIngreso.toISOString().split("T")[0];

      const seDebeActualizar = !ordenActual.fechaEntrega || mismoDia;

      if (fechaEntrega === undefined && seDebeActualizar) {
        fechaFinalEntrega = dayjs().toDate();
      }
    }

    const datosParaGuardar: any = {
      ...rest,
      ...(estado !== undefined && { estado }),
      ...(fechaFinalEntrega !== undefined && {
        fechaEntrega: fechaFinalEntrega,
      }),
    };

    await prisma.orden.update({
      where: { id: Number(id) },
      data: datosParaGuardar,
    });

    const ordenActualizada = await prisma.orden.findUnique({
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
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
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

export async function deleteOrden(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const existente = await prisma.orden.findUnique({
      where: { id: Number(id) },
    });

    if (!existente) {
      return res
        .status(404)
        .json({ message: "Orden no encontrada para eliminar." });
    }

    await prisma.detalleOrden.deleteMany({ where: { ordenId: Number(id) } });
    await prisma.pago.deleteMany({ where: { ordenId: Number(id) } });
    await prisma.orden.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
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

export async function actualizarObservacion(req: Request, res: Response) {
  const { id } = req.params;
  const result = ObservacionUpdateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validación fallida",
      detalles: result.error.format(),
    });
  }

  const { observaciones } = result.data;

  try {
    await prisma.orden.update({
      where: { id: Number(id) },
      data: { observaciones },
    });

    const actualizada = await prisma.orden.findUnique({
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
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
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
