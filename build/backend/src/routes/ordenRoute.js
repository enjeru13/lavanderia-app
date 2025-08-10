"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ordenController_1 = require("../controllers/ordenController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN, client_1.Role.EMPLOYEE]), ordenController_1.getAllOrdenes);
router.get("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN, client_1.Role.EMPLOYEE]), ordenController_1.getOrdenById);
router.post("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN, client_1.Role.EMPLOYEE]), ordenController_1.createOrden);
router.put("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN, client_1.Role.EMPLOYEE]), ordenController_1.updateOrden);
router.delete("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN]), ordenController_1.deleteOrden);
router.patch("/:id/observacion", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN]), ordenController_1.actualizarObservacion);
exports.default = router;
//# sourceMappingURL=ordenRoute.js.map