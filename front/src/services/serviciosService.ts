import axios from "axios";
import type {
  Servicio,
  ServicioCreate,
  ServicioUpdatePayload,
} from "../types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const servicioService = {
  /**
   * @returns
   */
  getAll: (): Promise<{ data: Servicio[] }> => api.get("/servicios"),

  /**
   * @param
   * @returns
   */
  getById: (id: number): Promise<{ data: Servicio }> =>
    api.get(`/servicios/${id}`),

  /**
   * @param
   * @returns
   */
  create: (data: ServicioCreate): Promise<{ data: Servicio }> =>
    api.post("/servicios", data),

  /**
   * @param
   * @param
   * @returns
   */
  update: (
    id: number,
    data: ServicioUpdatePayload
  ): Promise<{ data: Servicio }> => api.put(`/servicios/${id}`, data),

  /**
   * @param
   * @returns
   */
  delete: (id: number): Promise<void> => api.delete(`/servicios/${id}`),
};
