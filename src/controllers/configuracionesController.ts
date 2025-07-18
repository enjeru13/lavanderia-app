import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener la configuración actual del sistema
export async function getConfiguracion(req: Request, res: Response) {
  try {
    let config = await prisma.configuracion.findFirst();

    if (!config) {
      config = await prisma.configuracion.create({
        data: {
          nombreNegocio: "Mi negocio",
          monedaPrincipal: "USD",
          tasaUSD: 1,
          tasaVES: null,
          tasaCOP: null,
          rif: "",
          direccion: "",
          telefonoPrincipal: "",
          telefonoSecundario: "",
          mensajePieRecibo: "",
        },
      });
    }

    return res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return res.status(500).json({ message: "Error al obtener configuración" });
  }
}

// Actualizar configuración global
export async function updateConfiguracion(req: Request, res: Response) {
  const {
    nombreNegocio,
    monedaPrincipal,
    tasaVES,
    tasaCOP,
    rif,
    direccion,
    telefonoPrincipal,
    telefonoSecundario,
    mensajePieRecibo,
  } = req.body;

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
        tasaUSD: 1, // se mantiene fija
        tasaVES: tasaVES !== undefined ? Number(tasaVES) : null,
        tasaCOP: tasaCOP !== undefined ? Number(tasaCOP) : null,
        rif,
        direccion,
        telefonoPrincipal,
        telefonoSecundario,
        mensajePieRecibo,
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
