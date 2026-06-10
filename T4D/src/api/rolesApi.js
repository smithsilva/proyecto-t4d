import axios from "axios";

const API_URL = "http://localhost:5000/roles";

// ==========================================
// OBTENER ROLES
// ==========================================

export const obtenerRoles = async () => {

  try {

    const response = await axios.get(API_URL);

    return response.data;

  } catch (error) {

    console.log("Error obteniendo roles:", error);

    throw error;

  }

};