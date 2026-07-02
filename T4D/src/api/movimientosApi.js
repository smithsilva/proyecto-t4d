import { getHeaders } from "./authHeader";

export const obtenerMovimientosApi = async () => {
  const response = await fetch("http://localhost:5000/movimientos", {
    headers: getHeaders(),
  });

  const data = await response.json();
  return data.movimientos;
};