import axios from "axios";
import type { Configuracion } from "../types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const configuracionService = {
  get: (): Promise<{ data: Configuracion }> => api.get("/configuracion"),

  update: (data: Partial<Configuracion>) =>
    api.put<Configuracion>("/configuracion", data),
};
