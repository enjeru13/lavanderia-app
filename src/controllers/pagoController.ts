import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener todos los pagos
export async function getAllPagos(req: Request, res: Response) {
  try {
    const pagos = await prisma.pago.findMany({
      include: {
        orden: {
          select: {
            id: true,
            clienteId: true,
            estado: true,
            total: true,
          },
        },
      },
      orderBy: { fechaPago: "desc" },
    });
    return res.json(pagos);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return res.status(500).json({ message: "Error al obtener pagos" });
  }
}

// Obtener un pago por ID
export async function getPagoById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const pago = await prisma.pago.findUnique({
      where: { id: Number(id) },
      include: { orden: true },
    });

    if (!pago) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    return res.json(pago);
  } catch (error) {
    console.error("Error al obtener pago:", error);
    return res.status(500).json({ message: "Error al obtener pago" });
  }
}

// Registrar un nuevo pago con moneda
export async function createPago(req: Request, res: Response) {
  const { ordenId, monto, metodoPago, moneda } = req.body;

  if (!ordenId || !monto || !metodoPago || !moneda) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const nuevoPago = await prisma.pago.create({
      data: {
        ordenId,
        monto: Number(monto),
        metodoPago,
        moneda,
      },
    });

    const pagosActuales = await prisma.pago.findMany({ where: { ordenId } });
    const totalPagado = pagosActuales.reduce((sum, p) => sum + p.monto, 0);

    const orden = await prisma.orden.findUnique({ where: { id: ordenId } });
    if (!orden) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (totalPagado >= orden.total) {
      const nuevoEstado = orden.estado === "ENTREGADO" ? "ENTREGADO" : "PAGADO";
      await prisma.orden.update({
        where: { id: ordenId },
        data: { estado: nuevoEstado },
      });
    }

    return res.status(201).json(nuevoPago);
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return res.status(500).json({ message: "Error al registrar pago" });
  }
}

// Actualizar un pago existente
export async function updatePago(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const pago = await prisma.pago.update({
      where: { id: Number(id) },
      data: req.body,
    });
    return res.json(pago);
  } catch (error) {
    console.error("Error al actualizar pago:", error);
    return res.status(500).json({ message: "Error al actualizar pago" });
  }
}

// Eliminar un pago
export async function deletePago(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.pago.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    return res.status(500).json({ message: "Error al eliminar pago" });
  }
}
