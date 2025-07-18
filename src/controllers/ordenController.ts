import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ordenSchema, ordenUpdateSchema } from "../schemas/orden.schema";

const prisma = new PrismaClient();

// Obtener todas las órdenes
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

// Obtener una orden por ID
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

// Crear una nueva orden (fechaEntrega opcional) con campos financieros
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
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
        abonado: 0,
        faltante: total,
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

  console.log("Payload recibido:", result.data);
  console.log("Fecha entrega recibida:", fechaEntrega);
  console.log("Estado recibido:", estado);

  const ordenActual = await prisma.orden.findUnique({
    where: { id: Number(id) },
    select: { fechaIngreso: true, fechaEntrega: true },
  });

  console.log("Orden actual en BD:");
  console.log("Fecha ingreso:", ordenActual?.fechaIngreso);
  console.log("Fecha entrega actual:", ordenActual?.fechaEntrega);

  let fechaFinalEntrega: Date | null = ordenActual?.fechaEntrega || null;

  if (estado === "ENTREGADO") {
    const mismoDia =
      ordenActual?.fechaEntrega &&
      ordenActual.fechaEntrega.toISOString() ===
        ordenActual.fechaIngreso.toISOString();

    const seDebeActualizar = !ordenActual?.fechaEntrega || mismoDia;

    if (fechaEntrega) {
      fechaFinalEntrega = new Date(fechaEntrega);
    } else if (seDebeActualizar) {
      fechaFinalEntrega = new Date();
    }

    console.log(
      "Nueva fecha entrega generada para ENTREGADO:",
      fechaFinalEntrega
    );
  } else if (fechaEntrega) {
    fechaFinalEntrega = new Date(fechaEntrega);
    console.log(
      "Nueva fecha entrega para estado distinto a ENTREGADO:",
      fechaFinalEntrega
    );
  }

  try {
    const datosParaGuardar = {
      ...rest,
      ...(estado && { estado }),
      ...(fechaFinalEntrega && { fechaEntrega: fechaFinalEntrega }),
    };

    console.log("Data que se va a guardar en BD:", datosParaGuardar);

    await prisma.orden.update({
      where: { id: Number(id) },
      data: datosParaGuardar,
    });

    // 🔄 Reconsultar orden completa para enviar al frontend
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
    console.error("Error al actualizar orden:", error);
    return res.status(500).json({ message: "Error al actualizar orden" });
  }
}

// Eliminar una orden y sus detalles
export async function deleteOrden(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.detalleOrden.deleteMany({ where: { ordenId: Number(id) } });
    await prisma.pago.deleteMany({ where: { ordenId: Number(id) } });
    await prisma.orden.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar orden:", error);
    return res.status(500).json({ message: "Error al eliminar orden" });
  }
}

// Actualizar observaciones únicamente
export async function actualizarObservacion(req: Request, res: Response) {
  const { id } = req.params;
  const { observaciones } = req.body;

  if (typeof observaciones !== "string") {
    return res.status(400).json({ message: "Observación inválida" });
  }

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

    return res.status(200).json(actualizada);
  } catch (error) {
    console.error("Error al actualizar observaciones:", error);
    return res.status(404).json({
      message: "Orden no encontrada o error al actualizar.",
    });
  }
}
