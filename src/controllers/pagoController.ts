import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { calcularResumenPago } from "../../shared/shared/utils/pagoFinance";
import { PagoSchema } from "../schemas/pago.schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

async function recalcularEstadoOrden(ordenId: number, res: Response) {
  const orden = await prisma.orden.findUnique({ where: { id: ordenId } });
  if (!orden) {
    console.error(
      `Inconsistencia de datos: Orden con ID ${ordenId} no encontrada para recalcular estado.`
    );
    throw new Error(
      `Orden con ID ${ordenId} no encontrada para recalcular estado.`
    );
  }

  const pagos = await prisma.pago.findMany({ where: { ordenId } });
  const config = await prisma.configuracion.findFirst();

  const tasas = {
    VES: config?.tasaVES ?? 1,
    COP: config?.tasaCOP ?? 1,
  };

  const resumen = calcularResumenPago({ total: orden.total, pagos }, tasas);

  await prisma.orden.update({
    where: { id: ordenId },
    data: {
      abonado: resumen.abonado,
      faltante: resumen.faltante,
      estadoPago: resumen.estadoRaw,
    },
  });
}

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
            abonado: true,
            faltante: true,
            estadoPago: true,
          },
        },
        vueltos: true,
      },
      orderBy: { fechaPago: "desc" },
    });

    return res.json(pagos);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return res.status(500).json({ message: "Error al obtener pagos" });
  }
}

export async function getPagoById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const pago = await prisma.pago.findUnique({
      where: { id: Number(id) },
      include: {
        orden: { include: { cliente: true } },
        vueltos: true,
      },
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

export async function createPago(req: Request, res: Response) {
  const result = PagoSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: result.error.format(),
    });
  }

  const {
    ordenId,
    monto,
    metodoPago,
    moneda,
    nota,
    vueltos = [],
  } = result.data;

  try {
    const ordenExistente = await prisma.orden.findUnique({
      where: { id: ordenId },
    });
    if (!ordenExistente) {
      return res
        .status(404)
        .json({ message: `Orden con ID ${ordenId} no encontrada.` });
    }

    const nuevoPago = await prisma.pago.create({
      data: {
        ordenId,
        monto,
        metodoPago,
        moneda,
        nota: nota ?? null,
      },
    });

    if (vueltos.length > 0) {
      const vueltosValidos = vueltos.map((v) => ({
        pagoId: nuevoPago.id,
        monto: v.monto,
        moneda: v.moneda,
      }));

      await prisma.vueltoEntregado.createMany({ data: vueltosValidos });
    }

    await recalcularEstadoOrden(ordenId, res);

    return res.status(201).json(nuevoPago);
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return res.status(500).json({ message: "Error al registrar pago" });
  }
}

export async function updatePago(req: Request, res: Response) {
  const { id } = req.params;
  const result = PagoSchema.partial().safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Datos inválidos para actualizar pago",
      detalles: result.error.format(),
    });
  }

  try {
    const pagoExistente = await prisma.pago.findUnique({
      where: { id: Number(id) },
    });
    if (!pagoExistente) {
      return res
        .status(404)
        .json({ message: "Pago no encontrado para actualizar." });
    }

    const pagoActualizado = await prisma.pago.update({
      where: { id: Number(id) },
      data: result.data,
    });

    await recalcularEstadoOrden(pagoActualizado.ordenId, res);

    return res.json(pagoActualizado);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ message: "Pago no encontrado para actualizar." });
      }
    }
    console.error("Error al actualizar pago:", error);
    return res.status(500).json({ message: "Error al actualizar pago" });
  }
}

export async function deletePago(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const pago = await prisma.pago.findUnique({ where: { id: Number(id) } });
    if (!pago) {
      return res
        .status(404)
        .json({ message: "Pago no encontrado para eliminar." });
    }

    await prisma.pago.delete({ where: { id: Number(id) } });

    await recalcularEstadoOrden(pago.ordenId, res);

    return res.status(204).send();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ message: "Pago no encontrado para eliminar." });
      }
    }
    console.error("Error al eliminar pago:", error);
    return res.status(500).json({ message: "Error al eliminar pago" });
  }
}
