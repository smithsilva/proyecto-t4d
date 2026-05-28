const URL =
  "http://localhost:5000/proveedores";

// GET
export const obtenerProveedores =
  async () => {

    const response =
      await fetch(URL);

    return await response.json();
};

// POST
export const crearProveedor = async (proveedor) => {

    const response =
      await fetch(URL, {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          proveedor
        ),
      });

    return await response.json();
};

// PUT
export const editarProveedorApi =
  async (
    id,
    proveedor
  ) => {

    const response =
      await fetch(
        `${URL}/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            proveedor
          ),
        }
      );

    return await response.json();
};

// DELETE
export const eliminarProveedorApi =
  async (id) => {

    const response =
      await fetch(
        `${URL}/${id}`,
        {
          method: "DELETE",
        }
      );

    return await response.json();
};