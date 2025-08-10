"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const detalleOrdenController_1 = require("../controllers/detalleOrdenController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.protect, detalleOrdenController_1.getAllDetalle);
router.get("/by-order", authMiddleware_1.protect, detalleOrdenController_1.getDetallesByOrdenId);
router.get("/:id", authMiddleware_1.protect, detalleOrdenController_1.getDetalleById);
router.post("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN", "EMPLOYEE"]), detalleOrdenController_1.createDetalle);
router.put("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN", "EMPLOYEE"]), detalleOrdenController_1.updateDetalle);
router.delete("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN"]), detalleOrdenController_1.deleteDetalle);
exports.default = router;
//# sourceMappingURL=detalleOrdenRoute.js.map