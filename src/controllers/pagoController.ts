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

// Obtener un pago por ID
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

// Registrar un nuevo pago con múltiples vueltos
export async function createPago(req: Request, res: Response) {
  const { ordenId, monto, metodoPago, moneda, nota, vueltos = [] } = req.body;

  if (!ordenId || !monto || !metodoPago || !moneda) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    // Registrar el pago original como fue ingresado
    const nuevoPago = await prisma.pago.create({
      data: {
        ordenId,
        monto: Number(monto),
        metodoPago,
        moneda,
        nota: nota ?? null,
      },
    });

    // Registrar vueltos si existen
    if (Array.isArray(vueltos) && vueltos.length > 0) {
      await prisma.vueltoEntregado.createMany({
        data: vueltos
          .filter((v) => v.monto && v.moneda)
          .map((v) => ({
            pagoId: nuevoPago.id,
            monto: Number(v.monto),
            moneda: v.moneda,
          })),
      });
    }

    // Obtener pagos actuales de la orden
    const pagosActuales = await prisma.pago.findMany({
      where: { ordenId },
    });

    // Obtener configuración de tasas
    const config = await prisma.configuracion.findFirst();
    const tasaVES = config?.tasaVES || 1;
    const tasaCOP = config?.tasaCOP || 1;

    // Función para convertir a USD
    const convertirAUSD = (monto: number, moneda: string): number => {
      if (moneda === "USD") return monto;
      if (moneda === "VES") return monto / tasaVES;
      if (moneda === "COP") return monto / tasaCOP;
      return monto;
    };

    // Calcular total abonado en USD
    const totalPagadoUSD = pagosActuales.reduce(
      (sum, p) => sum + convertirAUSD(p.monto, p.moneda),
      0
    );

    const ordenOriginal = await prisma.orden.findUnique({
      where: { id: ordenId },
    });

    if (!ordenOriginal) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const faltante = Math.max(ordenOriginal.total - totalPagadoUSD, 0);
    const estadoPago = faltante <= 0 ? "COMPLETO" : "INCOMPLETO";

    await prisma.orden.update({
      where: { id: ordenId },
      data: {
        abonado: totalPagadoUSD,
        faltante,
        estadoPago,
      },
    });

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
