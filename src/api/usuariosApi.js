import axios from "axios";
import { getHeaders } from "./authHeader";

const API_URL = "http://localhost:5000/usuarios";

export const obtenerUsuarios = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.log("Error obteniendo usuarios:", error);
    throw error;
  }
};

export const crearUsuario = async (usuario) => {
  try {
    const response = await axios.post(API_URL, usuario, { headers: getHeaders(true) });
    return response.data;
  } catch (error) {
    console.log("Error creando usuario:", error);
    throw error;
  }
};

export const editarUsuario = async (id, usuario) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, usuario, { headers: getHeaders(true) });
    return response.data;
  } catch (error) {
    console.log("Error editando usuario:", error);
    throw error;
  }
};

export const eliminarUsuario = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.log("Error eliminando usuario:", error);
    throw error;
  }
};

export const actualizarParcialUsuario = async (id, datos) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, datos, { headers: getHeaders(true) });
    return response.data;
  } catch (error) {
    console.log("Error actualizando parcialmente usuario:", error);
    throw error;
  }
};