"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clienteController_1 = require("../controllers/clienteController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.protect, clienteController_1.getAllClientes);
router.get("/:id", authMiddleware_1.protect, clienteController_1.getClienteById);
router.post("/", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN", "EMPLOYEE"]), clienteController_1.createCliente);
router.put("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN", "EMPLOYEE"]), clienteController_1.updateCliente);
router.delete("/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)(["ADMIN"]), clienteController_1.deleteCliente);
exports.default = router;
//# sourceMappingURL=clienteRoute.js.map