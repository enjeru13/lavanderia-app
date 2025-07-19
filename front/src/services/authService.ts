import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  /**
   * @param
   * @returns
   */
  validarAdminPassword: async (password: string): Promise<boolean> => {
    try {
      const response = await api.post("/auth/validate-admin-password", {
        password,
      });
      return response.status === 200 && response.data.isValid === true;
    } catch (error) {
      console.error("Error al validar contraseña de administrador:", error);
      return false;
    }
  },
};
