import axios from "axios";
import { getHeaders } from "./authHeader";

const API_URL = "http://localhost:5000/roles";

export const obtenerRoles = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.log("Error obteniendo roles:", error);
    throw error;
  }
};