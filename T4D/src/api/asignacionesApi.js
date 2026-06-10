const URL =
  "http://localhost:5000/asignaciones";

export const obtenerAsignaciones =
  async () => {

    const response =
      await fetch(URL);

    return await response.json();
};