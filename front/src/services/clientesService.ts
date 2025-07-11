import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getClientes = () => api.get("/clientes");
