import { Router } from "express";
import {
  getAllDetalle,
  getDetalleById,
  createDetalle,
  updateDetalle,
  deleteDetalle,
} from "../controllers/detalleOrden";

const router = Router();

router.get("/", getAllDetalle);
router.get("/:id", getDetalleById);
router.post("/", createDetalle);
router.put("/:id", updateDetalle);
router.delete("/:id", deleteDetalle);

export default router;
