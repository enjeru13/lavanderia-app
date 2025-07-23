import { Router } from "express";
import {
  getAllOrdenes,
  getOrdenById,
  createOrden,
  updateOrden,
  deleteOrden,
  actualizarObservacion,
} from "../controllers/ordenController";
import { protect, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, getAllOrdenes);
router.get("/:id", protect, getOrdenById);
router.post("/", protect, authorizeRoles(["ADMIN", "EMPLOYEE"]), createOrden);
router.put("/:id", protect, authorizeRoles(["ADMIN", "EMPLOYEE"]), updateOrden);
router.delete("/:id", protect, authorizeRoles(["ADMIN"]), deleteOrden);
router.put(
  "/:id/observacion",
  protect,
  authorizeRoles(["ADMIN", "EMPLOYEE"]),
  actualizarObservacion
);

export default router;
