import axios from "axios";
import type { Configuracion, ConfiguracionUpdatePayload } from "../types/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const configuracionService = {
  /**
   * @returns
   */
  get: (): Promise<{ data: Configuracion }> => api.get("/configuracion"),

  /**
   * @param
   * @returns
   */
  update: (data: ConfiguracionUpdatePayload) =>
    api.put<Configuracion>("/configuracion", data),
};
