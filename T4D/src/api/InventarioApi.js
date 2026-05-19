const URL = "http://localhost:5000/productos";

// =====================================
// OBTENER PRODUCTOS
// =====================================

export const obtenerProductosApi = async () => {

  const response = await fetch(URL);

  return await response.json();

};

// =====================================
// AGREGAR PRODUCTO
// =====================================

export const agregarProductoApi = async (
  producto
) => {

  const response = await fetch(URL, {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(producto),

  });

  return await response.json();

};

// =====================================
// EDITAR PRODUCTO
// =====================================

export const editarProductoApi = async (
  id,
  producto
) => {

  const response = await fetch(
    `${URL}/${id}`,
    {

      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(producto),

    }
  );

  return await response.json();

};

// =====================================
// ELIMINAR PRODUCTO
// =====================================

export const eliminarProductoApi = async (
  id
) => {

  const response = await fetch(
    `${URL}/${id}`,
    {
      method: "DELETE",
    }
  );

  return await response.json();

};