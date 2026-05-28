const obtenerMovimientos = async (
  req,
  res
) => {

  try {

    res.json({
      mensaje:
        "Lista de movimientos",
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

};

const crearMovimiento = async (
  req,
  res
) => {

  try {

    const datos = req.body;

    res.status(201).json({
      mensaje:
        "Movimiento creado correctamente",
      datos,
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

};

module.exports = {
  obtenerMovimientos,
  crearMovimiento,
};