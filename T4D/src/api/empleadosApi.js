import { BACKEND_URL } from "../apiConfig";
import axios from "axios";
import { getHeaders } from "./authHeader";

const API_URL = `${BACKEND_URL}/empleados`;

// Saca el mensaje que manda el backend ({ error: "..." }) o uno genérico
export const mensajeError = (error) =>
  error?.response?.data?.error || error?.message || "Ocurrió un error inesperado";

// Admin y Contadora
export const obtenerEmpleados = async () => {
  const response = await axios.get(API_URL, { headers: getHeaders() });
  return response.data;
};

// Solo Admin
export const crearEmpleado = async (empleado) => {
  const response = await axios.post(API_URL, empleado, { headers: getHeaders(true) });
  return response.data;
};

// Solo Admin (edición completa)
export const editarEmpleado = async (id, empleado) => {
  const response = await axios.put(`${API_URL}/${id}`, empleado, { headers: getHeaders(true) });
  return response.data;
};

// Admin (cualquier campo) · Contadora (solo tipo_contrato y fecha_terminacion)
export const actualizarParcialEmpleado = async (id, datos) => {
  const response = await axios.patch(`${API_URL}/${id}`, datos, { headers: getHeaders(true) });
  return response.data;
};

// Solo Admin
export const eliminarEmpleado = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
  return response.data;
};