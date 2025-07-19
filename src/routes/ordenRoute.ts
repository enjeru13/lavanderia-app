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
router.delete("/:id", deleteOrden);
router.put("/:id/observacion", actualizarObservacion);

export default router;
