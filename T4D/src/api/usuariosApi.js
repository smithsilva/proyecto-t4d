import axios from "axios";

const API_URL = "http://localhost:5000/usuarios";

const headers = {
  "x-api-key": "pollo",
};


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


export const actualizarParcialUsuario = async (id, datos) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}`,
      datos,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log("Error actualizando parcialmente usuario:", error);
    throw error;
  }
};