import { Router } from "express";
import {
  getAllServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
} from "../controllers/servicio";

const router = Router();

router.get("/", getAllServicios);
router.get("/:id", getServicioById);
router.post("/", createServicio);
router.put("/:id", updateServicio);
router.delete("/:id", deleteServicio);

export default router;
