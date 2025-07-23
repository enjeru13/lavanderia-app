import { Router } from "express";
import {
  getAllServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
} from "../controllers/servicioController";
import { protect, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles(["ADMIN", "EMPLOYEE"]),
  getAllServicios
);
router.get(
  "/:id",
  protect,
  authorizeRoles(["ADMIN", "EMPLOYEE"]),
  getServicioById
);
router.post(
  "/",
  protect,
  authorizeRoles(["ADMIN", "EMPLOYEE"]),
  createServicio
);
router.put(
  "/:id",
  protect,
  authorizeRoles(["ADMIN", "EMPLOYEE"]),
  updateServicio
);
router.delete("/:id", protect, authorizeRoles(["ADMIN"]), deleteServicio);

export default router;
