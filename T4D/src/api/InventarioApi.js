const URL = "http://localhost:5000/productos";

const headers = {
  "Content-Type": "application/json",
  "x-api-key": "pollo",
};

export const obtenerProductosApi = async () => {
  const response = await fetch(URL, {
    headers,
  });

  return await response.json();
};

export const agregarProductoApi = async (producto) => {
  const response = await fetch(URL, {
    method: "POST",
    headers,
    body: JSON.stringify(producto),
  });

  return await response.json();
};

export const editarProductoApi = async (id, producto) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(producto),
  });

  return await response.json();
};

export const eliminarProductoApi = async (id) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: {
      "x-api-key": "pollo",
    },
  });

  return await response.json();
};

export const actualizarParcialProductoApi = async (id, datos) => {
  const response = await fetch(`${URL}/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(datos),
  });

  return await response.json();
};