"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("CRITICAL ERROR: JWT_SECRET is not defined in environment variables for authMiddleware.");
}
const protect = async (req, res, next) => {
    let token;
    if (!req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer")) {
        return res.status(401).json({
            message: "No autorizado, no se encontró token o formato incorrecto.",
        });
    }
    token = req.headers.authorization.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true },
        });
        if (!user) {
            return res.status(401).json({
                message: "No autorizado, token fallido o usuario no encontrado.",
            });
        }
        req.user = { id: user.id, role: user.role };
        next();
        return;
    }
    catch (error) {
        console.error("Error al verificar token o buscar usuario:", error);
        return res.status(401).json({
            message: "No autorizado, token inválido o error en la base de datos.",
        });
    }
};
exports.protect = protect;
/**
 * @param roles
 */
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res
                .status(403)
                .json({ message: "Acceso denegado, usuario no autenticado." });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Acceso denegado, rol ${req.user.role} no autorizado para esta acción.`,
            });
        }
        next();
        return;
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=authMiddleware.js.map