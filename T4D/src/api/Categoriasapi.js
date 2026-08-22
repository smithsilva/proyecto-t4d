import { getHeaders } from "./authHeader";

const URL = "http://localhost:5000/categorias";

export const obtenerCategoriasApi = async () => {
  const response = await fetch(URL, {
    headers: getHeaders(),
  });
  return await response.json();
};

export const agregarCategoriaApi = async (categoria) => {
  const response = await fetch(URL, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(categoria),
  });
  return await response.json();
};

export const editarCategoriaApi = async (id, categoria) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(categoria),
  });
  return await response.json();
};

export const actualizarParcialCategoriaApi = async (id, datos) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(datos),
  });
  return await response.json();
};

export const eliminarCategoriaApi = async (id) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return await response.json();
};