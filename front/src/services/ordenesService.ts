import axios from "axios";
import type { Orden, OrdenCreate, OrdenUpdatePayload } from "../types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const ordenesService = {
  getAll: (): Promise<{ data: Orden[] }> => api.get("/ordenes"),

  getById: (id: number): Promise<{ data: Orden }> => api.get(`/ordenes/${id}`),

  create: (data: OrdenCreate): Promise<{ data: Orden }> =>
    api.post("/ordenes", data),

  update: (id: number, data: OrdenUpdatePayload): Promise<{ data: Orden }> =>
    api.put(`/ordenes/${id}`, data),

  delete: (id: number): Promise<void> => api.delete(`/ordenes/${id}`),

  updateObservacion: (
    id: number,
    observaciones: string | null
  ): Promise<{ data: Orden }> =>
    api.put(`/ordenes/${id}/observacion`, { observaciones }),
};
