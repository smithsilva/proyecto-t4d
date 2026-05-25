import axios from "axios";

const API_URL = "http://localhost:5000/proveedores";

// ==========================================
// OBTENER PROVEEDORES
// ==========================================

export const obtenerProveedores = async () => {

  try {

    const response = await axios.get(API_URL);

    return response.data;

  } catch (error) {

    console.log("Error obteniendo proveedores:", error);

    throw error;

  }

};

// ==========================================
// CREAR PROVEEDOR
// ==========================================

export const crearProveedor = async (proveedor) => {

  try {

    const response = await axios.post(
      API_URL,
      proveedor
    );

    return response.data;

  } catch (error) {

    console.log("Error creando proveedor:", error);

    throw error;

  }

};

// ==========================================
// EDITAR PROVEEDOR
// ==========================================

export const editarProveedor = async (id, proveedor) => {

  try {

    const response = await axios.put(
      `${API_URL}/${id}`,
      proveedor
    );

    return response.data;

  } catch (error) {

    console.log("Error editando proveedor:", error);

    throw error;

  }

};

// ==========================================
// ELIMINAR PROVEEDOR
// ==========================================

export const eliminarProveedor = async (id) => {

  try {

    const response = await axios.delete(
      `${API_URL}/${id}`
    );

    return response.data;

  } catch (error) {

    console.log("Error eliminando proveedor:", error);

    throw error;

  }

};