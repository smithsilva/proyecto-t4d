const URL =
  "http://localhost:5000/asignaciones";

export const obtenerAsignaciones =
  async () => {

    const response =
      await fetch(URL, {
        headers: {
          "x-api-key": "pollo",
        },
      });

    return await response.json();
};