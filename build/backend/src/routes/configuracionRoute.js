"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configuracionesController_1 = require("../controllers/configuracionesController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN, client_1.Role.EMPLOYEE]), configuracionesController_1.getConfiguracion);
router.put("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)([client_1.Role.ADMIN]), configuracionesController_1.updateConfiguracion);
exports.default = router;
//# sourceMappingURL=configuracionRoute.js.map