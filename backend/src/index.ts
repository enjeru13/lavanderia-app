import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

import { protect } from "./middleware/authMiddleware";

// Rutas
import clienteRouter from "./routes/clienteRoute";
import servicioRouter from "./routes/servicioRoute";
import ordenRouter from "./routes/ordenRoute";
import detalleRouter from "./routes/detalleOrdenRoute";
import pagoRouter from "./routes/pagoRoute";
import configuracionRouter from "./routes/configuracionRoute";
import authRoute from "./routes/authRoute";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api", protect);
app.use("/api/clientes", clienteRouter);
app.use("/api/servicios", servicioRouter);
app.use("/api/ordenes", ordenRouter);
app.use("/api/detalleOrdenes", detalleRouter);
app.use("/api/pagos", pagoRouter);
app.use("/api/configuracion", configuracionRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error global:", err);
  res.status(500).json({ message: "Ocurrió un error interno en el servidor." });
});

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );

export default app;
