const {
  obtenerMovimientosService,
  crearMovimientoService,
} = require("../services/movimientosService");

// =====================================
// GET - Obtener todos los movimientos
// =====================================
const obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await obtenerMovimientosService();
    res.json(movimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
};

// =====================================
// POST - Crear un nuevo movimiento
// =====================================
const crearMovimiento = async (req, res) => {
  try {
    // Se asume que los datos del movimiento vienen en el cuerpo (body) de la petición
    const data = await crearMovimientoService(req.body);
    
    // Retornamos un estado 201 (Created) con el movimiento creado
    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  obtenerMovimientos,
  crearMovimiento,
};