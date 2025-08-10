import axios from "axios";
import type { Orden, Pago } from "@lavanderia/shared/types/types";

const API_URL = "/api/ordenes";

interface UpdateObservacionPayload {
  observaciones: string | null;
}

export const ordenesService = {
  /**
   * @returns
   */
  getAll: () => {
    return axios.get<Orden[]>(API_URL);
  },

  /**
   * @param id
   * @returns
   */
  getById: (id: number) => {
    return axios.get<Orden>(`${API_URL}/${id}`);
  },

  /**
   * @param orden
   * @returns
   */
  create: (orden: Partial<Orden>) => {
    return axios.post<Orden>(API_URL, orden);
  },

  /**
   * @param id
   * @returns
   */
  update: (id: number, orden: Partial<Orden>) => {
    return axios.put<Orden>(`${API_URL}/${id}`, orden);
  },

  /**
   * @param id
   * @returns
   */
  delete: (id: number) => {
    return axios.delete(`${API_URL}/${id}`);
  },

  /**
   * @param id
   * @param observaciones
   * @returns
   */
  updateObservacion: (id: number, observaciones: string | null) => {
    const payload: UpdateObservacionPayload = { observaciones };
    return axios.patch<Orden>(`${API_URL}/${id}/observacion`, payload);
  },

  /**
   * @param ordenId
   * @param pago
   * @returns
   */
  createPago: (ordenId: number, pago: Partial<Pago>) => {
    return axios.post<Orden>(`${API_URL}/${ordenId}/pagos`, pago);
  },
};
