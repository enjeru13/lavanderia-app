import { Router } from "express";
import {
  getAllDetalle,
  getDetalleById,
  getDetallesByOrdenId,
  createDetalle,
  updateDetalle,
  deleteDetalle,
} from "../controllers/detalleOrdenController";

const router = Router();

router.get("/", getAllDetalle);
router.get("/by-order", getDetallesByOrdenId);
router.get("/:id", getDetalleById);
router.post("/", createDetalle);
router.put("/:id", updateDetalle);
router.delete("/:id", deleteDetalle);

export default router;
