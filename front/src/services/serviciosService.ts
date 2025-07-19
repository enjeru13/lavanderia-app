import axios from "axios";
import type { Servicio } from "../types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const servicioService = {
  getAll: (): Promise<{ data: Servicio[] }> => api.get("/servicios"),

  getById: (id: number): Promise<{ data: Servicio }> =>
    api.get(`/servicios/${id}`),

  create: (data: {
    nombre: string;
    precioBase: number;
    descripcion?: string;
  }) => api.post("/servicios", data),

  update: (id: number, data: Partial<Servicio>) =>
    api.put(`/servicios/${id}`, data),

  delete: (id: number) => api.delete(`/servicios/${id}`),
};
