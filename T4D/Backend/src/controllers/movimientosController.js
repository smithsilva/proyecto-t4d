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

    const movimientos =
      await obtenerMovimientosService();

    res.json(movimientos);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

  }

    res.json(data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

  }

};

module.exports = {
  obtenerMovimientos,
  crearMovimiento,
};