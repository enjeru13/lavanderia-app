import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";

const validatePasswordSchema = z.object({
  password: z.string().min(1, "La contraseña no puede estar vacía."),
});

/**
 * @route
 * @desc
 * @access
 */
export const validateAdminPassword = async (req: Request, res: Response) => {
  try {
    const result = validatePasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validación fallida",
        detalles: result.error.format(),
      });
    }

    const { password } = result.data;
    const adminPasswordHash = process.env.ADMIN_PASSWORD;

    if (!adminPasswordHash) {
      console.error(
        "ADMIN_PASSWORD no está configurado en las variables de entorno del servidor."
      );
      return res
        .status(500)
        .json({ error: "Error de configuración del servidor." });
    }
    const isMatch = await bcrypt.compare(password, adminPasswordHash);

    if (isMatch) {
      return res
        .status(200)
        .json({ message: "Contraseña válida.", isValid: true });
    } else {
      return res
        .status(401)
        .json({ error: "Contraseña inválida.", isValid: false });
    }
  } catch (error) {
    console.error("Error al validar contraseña de administrador:", error);
    return res
      .status(500)
      .json({ error: "Error interno del servidor al validar la contraseña." });
  }
};
