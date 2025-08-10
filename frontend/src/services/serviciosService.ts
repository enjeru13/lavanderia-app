import apiClient from "../utils/apiClient";
import type {
  Servicio,
  ServicioCreate,
  ServicioUpdatePayload,
} from "@lavanderia/shared/types/types";

export const servicioService = {
  /**
   * @returns
   */
  getAll: (): Promise<{ data: Servicio[] }> => apiClient.get("/servicios"),

  /**
   * @param id
   * @returns
   */
  getById: (id: number): Promise<{ data: Servicio }> =>
    apiClient.get(`/servicios/${id}`),

  /**
   * @param data
   * @returns
   */
  create: (data: ServicioCreate): Promise<{ data: Servicio }> =>
    apiClient.post("/servicios", data),

  /**
   * @param id
   * @param data
   * @returns
   */
  update: (
    id: number,
    data: ServicioUpdatePayload
  ): Promise<{ data: Servicio }> => apiClient.put(`/servicios/${id}`, data),

  /**
   * @param id
   * @returns
   */
  delete: (id: number): Promise<void> => apiClient.delete(`/servicios/${id}`),
};
