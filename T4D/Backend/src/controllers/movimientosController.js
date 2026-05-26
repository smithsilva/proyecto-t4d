const {
  obtenerMovimientosService,
  crearMovimientoService,
} = require("../services/movimientosService");

// =====================================
// GET
// =====================================

const obtenerMovimientos = async (
  req,
  res
) => {

  try {

    const data =
      await obtenerMovimientosService();

    res.json(data);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

};

// =====================================
// POST
// =====================================

const crearMovimiento = async (
  req,
  res
) => {

  try {

    const movimiento = {
      ...req.body,
      fecha_movimiento: new Date(),
    };

    const data =
      await crearMovimientoService(
        movimiento
      );

    res.status(201).json({
      success: true,
      data,
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