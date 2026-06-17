import axios from "axios";

const API_URL = "http://localhost:5000/usuarios";

const headers = {
  "x-api-key": "pollo",
};

// ==========================================
// OBTENER USUARIOS
// ==========================================

export const obtenerUsuarios = async () => {

  try {

    const response = await axios.get(
      API_URL,
      { headers }
    );

    return response.data;

  } catch (error) {

    console.log("Error obteniendo usuarios:", error);

    throw error;

  }

};

// ==========================================
// CREAR USUARIO
// ==========================================

export const crearUsuario = async (usuario) => {

  try {

    const response = await axios.post(
      API_URL,
      usuario,
      { headers }
    );

    return response.data;

  } catch (error) {

    console.log("Error creando usuario:", error);

    throw error;

  }

};

// ==========================================
// EDITAR USUARIO
// ==========================================

export const editarUsuario = async (id, usuario) => {

  try {

    const response = await axios.put(
      `${API_URL}/${id}`,
      usuario,
      { headers }
    );

    return response.data;

  } catch (error) {

    console.log("Error editando usuario:", error);

    throw error;

  }

};

// ==========================================
// ELIMINAR USUARIO
// ==========================================

export const eliminarUsuario = async (id) => {

  try {

    const response = await axios.delete(
      `${API_URL}/${id}`,
      { headers }
    );

    return response.data;

  } catch (error) {

    console.log("Error eliminando usuario:", error);

    throw error;

  }

};