import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { PagoSchema } from "../schemas/pago.schema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { calcularResumenPago } from "@lavanderia/shared/dist/utils/pagoFinance";
import type {
  Moneda,
  TasasConversion,
} from "@lavanderia/shared/dist/types/types";

async function recalcularEstadoOrden(ordenId: number) {
  const orden = await prisma.orden.findUnique({
    where: { id: ordenId },
    include: { pagos: true },
  });

  if (!orden) {
    console.warn(
      `Orden con ID ${ordenId} no encontrada para recalcular estado.`
    );
    throw new Error(
      `Orden con ID ${ordenId} no encontrada para recalcular estado.`
    );
  }

  const config = await prisma.configuracion.findFirst();

  const principalMoneda: Moneda = (config?.monedaPrincipal || "USD") as Moneda;
  const tasas: TasasConversion = {
    VES: config?.tasaVES ?? null,
    COP: config?.tasaCOP ?? null,
  };

  console.log("DEBUG BACKEND: Recalculando estado para Orden ID:", ordenId);
  console.log("DEBUG BACKEND: Moneda Principal:", principalMoneda);
  console.log("DEBUG BACKEND: Tasas de Conversión:", tasas);
  console.log("DEBUG BACKEND: Pagos de la orden:", orden.pagos);
  console.log("DEBUG BACKEND: Total de la orden:", orden.total);

  const resumen = calcularResumenPago(
    { total: orden.total, pagos: orden.pagos },
    tasas,
    principalMoneda
  );

  console.log(
    "DEBUG BACKEND: Resumen calculado (abonado, faltante, estadoRaw):",
    resumen
  );

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
          include: {
            cliente: true,
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
        orden: {
          include: {
            cliente: true,
          },
        },
        vueltos: true,
      },
    });

    if (!pago) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    return res.json(pago);
  } catch (error) {
    console.error("Error al obtener pago por ID:", error);
    return res.status(500).json({ message: "Error al obtener pago por ID" });
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

    const config = await prisma.configuracion.findFirst();
    let tasaSnapshot = 1;
    if (config) {
      switch (moneda) {
        case "VES":
          // Guardamos la tasa del BCV/Paralelo de este momento exacto
          tasaSnapshot = config.tasaVES ?? 0;
          break;
        case "COP":
          // Guardamos la tasa de Pesos de este momento exacto
          tasaSnapshot = config.tasaCOP ?? 0;
          break;
        case "USD":
          // Si es dólar, la tasa es 1 (o podrías guardar la referencia en VES si quisieras)
          tasaSnapshot = 1;
          break;
      }
    }

    const nuevoPago = await prisma.pago.create({
      data: {
        ordenId,
        monto,
        moneda,
        metodoPago,
        nota: nota ?? null,
        tasa: tasaSnapshot,
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

    await recalcularEstadoOrden(ordenId);

    const pagoConOrden = await prisma.pago.findUnique({
      where: { id: nuevoPago.id },
      include: {
        orden: {
          include: {
            cliente: true,
          },
        },
        vueltos: true,
      },
    });

    return res.status(201).json(pagoConOrden);
  } catch (error) {
    console.error("Error al crear pago:", error);
    return res.status(500).json({ message: "Error al crear pago" });
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

  const { ordenId, vueltos, ...rest } = result.data;

  try {
    const pagoExistente = await prisma.pago.findUnique({
      where: { id: Number(id) },
      select: { ordenId: true },
    });

    if (!pagoExistente) {
      return res
        .status(404)
        .json({ message: "Pago no encontrado para actualizar." });
    }

    const pagoActualizado = await prisma.pago.update({
      where: { id: Number(id) },
      data: rest,
    });
    if (vueltos !== undefined) {
      await prisma.vueltoEntregado.deleteMany({
        where: { pagoId: pagoActualizado.id },
      });
      if (vueltos.length > 0) {
        await prisma.vueltoEntregado.createMany({
          data: vueltos.map((v) => ({ ...v, pagoId: pagoActualizado.id })),
        });
      }
    }

    await recalcularEstadoOrden(pagoExistente.ordenId);

    const pagoConOrden = await prisma.pago.findUnique({
      where: { id: pagoActualizado.id },
      include: {
        orden: {
          include: {
            cliente: true,
          },
        },
        vueltos: true,
      },
    });

    return res.json(pagoConOrden);
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
    const pagoExistente = await prisma.pago.findUnique({
      where: { id: Number(id) },
      select: { ordenId: true },
    });
    if (!pagoExistente) {
      return res
        .status(404)
        .json({ message: "Pago no encontrado para eliminar." });
    }

    await prisma.vueltoEntregado.deleteMany({ where: { pagoId: Number(id) } });

    await prisma.pago.delete({ where: { id: Number(id) } });

    await recalcularEstadoOrden(pagoExistente.ordenId);

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
