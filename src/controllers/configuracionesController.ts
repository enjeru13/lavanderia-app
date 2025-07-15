import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener la configuración actual del sistema
export async function getConfiguracion(req: Request, res: Response) {
  try {
    const config = await prisma.configuracion.findFirst();
    if (!config) {
      return res.status(404).json({ message: "Configuración no encontrada" });
    }
    return res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return res.status(500).json({ message: "Error al obtener configuración" });
  }
}

// Actualizar configuración global (tasas, moneda, nombre del negocio)
export async function updateConfiguracion(req: Request, res: Response) {
  const { nombreNegocio, monedaPrincipal, tasaVES, tasaCOP } = req.body;

  try {
    const config = await prisma.configuracion.findFirst();
    if (!config) {
      return res.status(404).json({ message: "Configuración no encontrada" });
    }

    const actualizada = await prisma.configuracion.update({
      where: { id: config.id },
      data: {
        nombreNegocio,
        monedaPrincipal,
        tasaVES: tasaVES !== undefined ? Number(tasaVES) : undefined,
        tasaCOP: tasaCOP !== undefined ? Number(tasaCOP) : undefined,
      },
    });

    return res.json(actualizada);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar configuración" });
  }
}
