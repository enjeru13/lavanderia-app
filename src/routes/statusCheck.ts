// src/routes/statusCheck.ts
import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "🟢 Ruta activa" });
});

export default router;