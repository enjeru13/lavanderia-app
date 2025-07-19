import axios from "axios";
import type { Pago, Moneda } from "../types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const pagosService = {
  registrar: (data: {
    ordenId: number;
    monto: number;
    moneda: Moneda;
    metodoPago: "EFECTIVO" | "TRANSFERENCIA" | "PAGO_MOVIL";
  }): Promise<{ data: Pago }> => api.post("/pagos", data),

  getAll: (): Promise<{ data: Pago[] }> => api.get("/pagos"),
};
