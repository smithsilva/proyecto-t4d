export const obtenerMovimientosApi =
  async () => {

    const response =
      await fetch(
        "http://localhost:5000/movimientos"
      );

    const data =
      await response.json();

    return data.movimientos;
};