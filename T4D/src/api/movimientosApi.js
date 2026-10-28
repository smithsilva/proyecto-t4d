import { BACKEND_URL } from "../apiConfig";
import { getHeaders } from "./authHeader";

export const obtenerMovimientosApi = async () => {
  const response = await fetch(`${BACKEND_URL}/movimientos`, {
    headers: getHeaders(),
  });

  const data = await response.json();
  return data.movimientos;
};