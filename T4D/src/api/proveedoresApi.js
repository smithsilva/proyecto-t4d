import { BACKEND_URL } from "../apiConfig";
import { getHeaders } from "./authHeader";

const URL = `${BACKEND_URL}/proveedores`;

export const obtenerProveedores = async () => {
  const response = await fetch(URL, {
    headers: getHeaders(),
  });
  return await response.json();
};

export const crearProveedor = async (proveedor) => {
  const response = await fetch(URL, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(proveedor),
  });
  return await response.json();
};

export const editarProveedorApi = async (id, proveedor) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(proveedor),
  });
  return await response.json();
};

export const eliminarProveedorApi = async (id) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return await response.json();
};