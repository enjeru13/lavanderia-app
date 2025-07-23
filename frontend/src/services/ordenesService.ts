import apiClient from "../utils/apiClient";
import type {
  Orden,
  OrdenCreate,
  OrdenUpdatePayload,
} from "../../../shared/types/types";

export const ordenesService = {
  getAll: (): Promise<{ data: Orden[] }> => apiClient.get("/ordenes"),

  getById: (id: number): Promise<{ data: Orden }> =>
    apiClient.get(`/ordenes/${id}`),

  create: (data: OrdenCreate): Promise<{ data: Orden }> =>
    apiClient.post("/ordenes", data),

  update: (id: number, data: OrdenUpdatePayload): Promise<{ data: Orden }> =>
    apiClient.put(`/ordenes/${id}`, data),

  delete: (id: number): Promise<void> => apiClient.delete(`/ordenes/${id}`),

  updateObservacion: (
    id: number,
    observaciones: string | null
  ): Promise<{ data: Orden }> =>
    apiClient.put(`/ordenes/${id}/observacion`, { observaciones }),
};
