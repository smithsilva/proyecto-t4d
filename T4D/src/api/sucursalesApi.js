import { getHeaders } from "./authHeader";

const URL = "http://localhost:5000/sucursales";

export const obtenerSucursalesApi = async () => {
  const response = await fetch(URL, {
    headers: getHeaders(),
  });
  return await response.json();
};

export const agregarSucursalApi = async (sucursal) => {
  const response = await fetch(URL, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(sucursal),
  });
  return await response.json();
};

export const actualizarSucursalApi = async (id, sucursal) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(sucursal),
  });
  return await response.json();
};

export const eliminarSucursalApi = async (id) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return await response.json();
};