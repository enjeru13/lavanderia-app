import axios from "axios";

export async function obtenerConfiguracion() {
  try {
    const res = await axios.get("/api/configuracion");
    return res.data;
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return null;
  }
}
