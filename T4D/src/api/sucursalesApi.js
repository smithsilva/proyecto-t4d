const URL = "http://localhost:5000/sucursales";

// GET
export const obtenerSucursalesApi = async () => {
  const response = await fetch(URL, {
    headers: {
      "x-api-key": "pollo",
    },
  });

  return await response.json();
};

// POST
export const agregarSucursalApi = async (sucursal) => {
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "pollo",
    },
    body: JSON.stringify(sucursal),
  });

  return await response.json();
};

// PUT
export const actualizarSucursalApi = async (
  id,
  sucursal
) => {
  const response = await fetch(
    `${URL}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
        "x-api-key":
          "pollo",
      },
      body: JSON.stringify(sucursal),
    }
  );

  return await response.json();
};

// DELETE
export const eliminarSucursalApi = async (
  id
) => {
  const response = await fetch(
    `${URL}/${id}`,
    {
      method: "DELETE",
      headers: {
        "x-api-key": "pollo",
      },
    }
  );

  return await response.json();
};