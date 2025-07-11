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
import statusCheckRouter from "./routes/statusCheck";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Monta rutas CRUD
console.log("🧩 Ruta clientes montada");
app.use("/api/clientes", clienteRouter);
console.log("🧩 Ruta servicios montada");
app.use("/api/servicios", servicioRouter);
console.log("🧩 Ruta ordenes montada");
app.use("/api/ordenes", ordenRouter);
console.log("🧩 Ruta detalleOrdenes montada");
app.use("/api/detalleOrdenes", detalleRouter);
console.log("🧩 Ruta pagos montada");
app.use("/api/pagos", pagoRouter);
console.log("🧩 Ruta configuracion montada");
app.use("/api/configuracion", configuracionRouter);
console.log("🧩 Ruta status montada");
app.use("/api/status", statusCheckRouter);

// Error handler genérico
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Error:", err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
