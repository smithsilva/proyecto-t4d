import { getHeaders } from "./authHeader";

const URL = "http://localhost:5000/asignaciones";

export const obtenerAsignaciones = async () => {
  const response = await fetch(URL, {
    headers: getHeaders(),
  });
  return await response.json();
};