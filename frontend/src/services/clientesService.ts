import axios from "axios";
import type {
  Cliente,
  ClienteCreate,
  ClienteUpdatePayload,
} from "../../../shared/types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const clientesService = {
  getAll: () => api.get<Cliente[]>("/clientes"),

  getById: (id: number) => api.get<Cliente>(`/clientes/${id}`),

  create: (data: ClienteCreate) => api.post<Cliente>("/clientes", data),

  update: (id: number, data: ClienteUpdatePayload) =>
    api.put<Cliente>(`/clientes/${id}`, data),

  delete: (id: number) => api.delete<void>(`/clientes/${id}`),
};
