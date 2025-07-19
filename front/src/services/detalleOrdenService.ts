import axios from "axios";
import type { DetalleOrden } from "../types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const detalleOrdenService = {
  getByOrdenId: (ordenId: number) =>
    api.get<DetalleOrden[]>(`/ordenes/${ordenId}/detalles`),

  getById: (detalleId: number) =>
    api.get<DetalleOrden>(`/detalles/${detalleId}`),

  create: (data: {
    ordenId: number;
    servicioId: number;
    cantidad: number;
    precioUnit: number;
  }) => api.post<DetalleOrden>("/detalles", data),

  update: (detalleId: number, data: Partial<DetalleOrden>) =>
    api.put<DetalleOrden>(`/detalles/${detalleId}`, data),

  delete: (detalleId: number) => api.delete<void>(`/detalles/${detalleId}`),
};
