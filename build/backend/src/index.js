"use strict";
// backend/src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const authMiddleware_1 = require("./middleware/authMiddleware");
// Rutas
const clienteRoute_1 = __importDefault(require("./routes/clienteRoute"));
const servicioRoute_1 = __importDefault(require("./routes/servicioRoute"));
const ordenRoute_1 = __importDefault(require("./routes/ordenRoute"));
const detalleOrdenRoute_1 = __importDefault(require("./routes/detalleOrdenRoute"));
const pagoRoute_1 = __importDefault(require("./routes/pagoRoute"));
const configuracionRoute_1 = __importDefault(require("./routes/configuracionRoute"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const app = (0, express_1.default)();
// Middlewares globales
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use("/api/auth", authRoute_1.default);
app.use("/api", authMiddleware_1.protect);
app.use("/api/clientes", clienteRoute_1.default);
app.use("/api/servicios", servicioRoute_1.default);
app.use("/api/ordenes", ordenRoute_1.default);
app.use("/api/detalleOrdenes", detalleOrdenRoute_1.default);
app.use("/api/pagos", pagoRoute_1.default);
app.use("/api/configuracion", configuracionRoute_1.default);
// Manejador de errores
app.use((err, req, res, next) => {
    console.error("Error global:", err);
    res.status(500).json({ message: "Ocurrió un error interno en el servidor." });
});
// Define el puerto de la aplicación.
const PORT = process.env.PORT || 4000;
// Inicia el servidor
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
//# sourceMappingURL=index.js.map