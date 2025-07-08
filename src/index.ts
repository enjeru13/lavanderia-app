import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

import clienteRouter from "./routes/cliente";
import servicioRouter from "./routes/servicio";
import ordenRouter from "./routes/orden";
import detalleRouter from "./routes/detalleOrden";
import pagoRouter from "./routes/pago";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Monta rutas CRUD
app.use("/api/clientes", clienteRouter);
app.use("/api/servicios", servicioRouter);
app.use("/api/ordenes", ordenRouter);
app.use("/api/detalleOrdenes", detalleRouter);
app.use("/api/pagos", pagoRouter);

// Error handler genérico
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Error:", err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
