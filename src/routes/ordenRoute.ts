import { Router } from "express";
import {
  getAllOrdenes,
  getOrdenById,
  createOrden,
  updateOrden,
  deleteOrden,
  actualizarObservacion,
} from "../controllers/ordenController";

const router = Router();

router.get("/", getAllOrdenes);
router.get("/:id", getOrdenById);
router.post("/", createOrden);
router.put("/:id", updateOrden);
router.put("/:id/observaciones", actualizarObservacion);
router.delete("/:id", deleteOrden);

export default router;
