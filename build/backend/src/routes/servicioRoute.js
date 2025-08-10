"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const servicioController_1 = require("../controllers/servicioController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN, client_1.Role.EMPLOYEE]), servicioController_1.getAllServicios);
router.get("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN, client_1.Role.EMPLOYEE]), servicioController_1.getServicioById);
router.post("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN]), servicioController_1.createServicio);
router.put("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN]), servicioController_1.updateServicio);
router.delete("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN]), servicioController_1.deleteServicio);
exports.default = router;
//# sourceMappingURL=servicioRoute.js.map