import { Router } from "express";
import { validateAdminPassword } from "../controllers/authController";

const router = Router();

router.post("/validate-admin-password", validateAdminPassword);

export default router;
