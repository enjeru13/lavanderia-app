import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

// Rutas
import clienteRouter from "./routes/clienteRoute";
import servicioRouter from "./routes/servicioRoute";
import ordenRouter from "./routes/ordenRoute";
import detalleRouter from "./routes/detalleOrdenRoute";
import pagoRouter from "./routes/pagoRoute";
import configuracionRouter from "./routes/configuracionRoute";
import authRoute from "./routes/authRoute"

const app = express();

// Middlewares globales
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Monta rutas CRUD
app.use("/api/clientes", clienteRouter);
app.use("/api/servicios", servicioRouter);
app.use("/api/ordenes", ordenRouter);
app.use("/api/detalleOrdenes", detalleRouter);
app.use("/api/pagos", pagoRouter);
app.use("/api/configuracion", configuracionRouter);
app.use("/api/auth", authRoute);

// Manejador de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error global:", err);
  res.status(500).json({ message: "Ocurrió un error interno en el servidor." });
});

// Define el puerto de la aplicación.
const PORT = process.env.PORT || 4000;

// Inicia el servidor
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
