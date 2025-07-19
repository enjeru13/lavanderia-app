import { Router } from "express";
import { getConfiguracion, updateConfiguracion } from "../controllers/configuracionesController";

const router = Router();
router.get("/", getConfiguracion);
router.put("/", updateConfiguracion);

export default router;