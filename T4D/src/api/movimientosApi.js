export const obtenerMovimientosApi =
  async () => {

    const response =
      await fetch(
        "http://localhost:5000/movimientos",
        {
          headers: {
            "x-api-key": "pollo",
          },
        }
      );

    const data =
      await response.json();

    return data.movimientos;
};