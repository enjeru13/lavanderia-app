import axios from "axios";
import type {
  DetalleOrden,
  DetalleOrdenCreate,
  DetalleOrdenUpdatePayload,
} from "../types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const detalleOrdenService = {
  /**
   * @param
   * @returns
   */
  getByOrdenId: (ordenId: number) =>
    api.get<DetalleOrden[]>(`/detalleOrdenes/by-order?ordenId=${ordenId}`),

  /**
   * @param
   * @returns
   */
  getById: (detalleId: number) =>
    api.get<DetalleOrden>(`/detalleOrdenes/${detalleId}`),

  /**
   * @param
   * @returns
   */
  create: (data: DetalleOrdenCreate) =>
    api.post<DetalleOrden>("/detalleOrdenes", data),

  /**
   * @param
   * @param
   * @returns
   */
  update: (detalleId: number, data: DetalleOrdenUpdatePayload) =>
    api.put<DetalleOrden>(`/detalleOrdenes/${detalleId}`, data),

  /**
   * @param
   * @returns
   */
  delete: (detalleId: number) =>
    api.delete<void>(`/detalleOrdenes/${detalleId}`),
};
