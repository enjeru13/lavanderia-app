import { Router } from "express";
import {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../controllers/cliente";

const router = Router();

router.get("/", getAllClientes);
router.get("/:id", getClienteById);
router.post("/", createCliente);
router.put("/:id", updateCliente);
router.delete("/:id", deleteCliente);

export default router;
