import { getHeaders } from "./authHeader";

const URL = "http://localhost:5000/historial-precios";

// =====================================
// PRODUCTOS
// =====================================

export const obtenerProductosApi = async () => {
  const response = await fetch(`${URL}/productos`, {
    headers: getHeaders(),
  });
  return await response.json();
};

// producto: { nombre_producto, precio_inicial, motivo }
export const crearProductoApi = async (producto) => {
  const response = await fetch(`${URL}/productos`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(producto),
  });
  return await response.json();
};

// datos: { nombre_producto?, precio_nuevo?, motivo? }
export const editarProductoApi = async (id, datos) => {
  const response = await fetch(`${URL}/productos/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(datos),
  });
  return await response.json();
};

export const cambiarEstadoProductoApi = async (id, activo) => {
  const response = await fetch(`${URL}/productos/${id}/estado`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify({ activo }),
  });
  return await response.json();
};

export const eliminarProductoApi = async (id) => {
  const response = await fetch(`${URL}/productos/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return await response.json();
};

// =====================================
// HISTORIAL
// =====================================

// idProducto es opcional: si se pasa, filtra el historial de un solo producto
export const obtenerHistorialApi = async (idProducto) => {
  const query = idProducto ? `?id_producto=${idProducto}` : "";
  const response = await fetch(`${URL}${query}`, {
    headers: getHeaders(),
  });
  return await response.json();
};

export const eliminarHistorialApi = async (id) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return await response.json();
};