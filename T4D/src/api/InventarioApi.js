import { getHeaders } from "./authHeader";

const URL = "http://localhost:5000/productos";

export const obtenerProductosApi = async () => {
  const response = await fetch(URL, {
    headers: getHeaders(),
  });
  return await response.json();
};

export const agregarProductoApi = async (producto) => {
  const response = await fetch(URL, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(producto),
  });
  return await response.json();
};

export const editarProductoApi = async (id, producto) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(producto),
  });
  return await response.json();
};

export const eliminarProductoApi = async (id) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return await response.json();
};

export const actualizarParcialProductoApi = async (id, datos) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(datos),
  });
  return await response.json();
};