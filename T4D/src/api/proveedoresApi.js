const URL =
  "http://localhost:5000/proveedores";


export const obtenerProveedores =
  async () => {

    const response =
      await fetch(URL, {
        headers: {
          "x-api-key": "pollo",
        },
      });

    return await response.json();
};

export const crearProveedor = async (proveedor) => {

    const response =
      await fetch(URL, {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
          "x-api-key":
            "pollo",
        },

        body: JSON.stringify(
          proveedor
        ),
      });

    return await response.json();
};


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
            "x-api-key":
              "pollo",
          },

          body: JSON.stringify(
            proveedor
          ),
        }
      );

    return await response.json();
};


export const eliminarProveedorApi =
  async (id) => {

    const response =
      await fetch(
        `${URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-api-key":
              "pollo",
          },
        }
      );

    return await response.json();
};