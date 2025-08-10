"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pagoController_1 = require("../controllers/pagoController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN", "EMPLOYEE"]), pagoController_1.getAllPagos);
router.get("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN", "EMPLOYEE"]), pagoController_1.getPagoById);
router.post("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN", "EMPLOYEE"]), pagoController_1.createPago);
router.put("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN", "EMPLOYEE"]), pagoController_1.updatePago);
router.delete("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN"]), pagoController_1.deletePago);
exports.default = router;
//# sourceMappingURL=pagoRoute.js.map