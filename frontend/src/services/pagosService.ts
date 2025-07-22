import axios from "axios";
import type { Pago, PagoCreate, PagoUpdatePayload } from "../../../shared/types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const pagosService = {
  /**
   * @param
   * @returns
   */
  create: (data: PagoCreate): Promise<{ data: Pago }> =>
    api.post("/pagos", data),

  /**
   * @returns
   */
  getAll: (): Promise<{ data: Pago[] }> => api.get("/pagos"),

  /**
   * @param
   * @returns
   */
  getById: (id: number): Promise<{ data: Pago }> => api.get(`/pagos/${id}`),

  /**
   * @param
   * @param
   * @returns
   */
  update: (id: number, data: PagoUpdatePayload): Promise<{ data: Pago }> =>
    api.put(`/pagos/${id}`, data),

  /**
   * @param
   * @returns
   */
  delete: (id: number): Promise<void> => api.delete(`/pagos/${id}`),
};
