import { BACKEND_URL } from "../apiConfig";
import { getHeaders } from "./authHeader";

const URL = `${BACKEND_URL}/asignaciones`;

export const obtenerAsignaciones = async () => {
  const response = await fetch(URL, {
    headers: getHeaders(),
  });
  return await response.json();
};