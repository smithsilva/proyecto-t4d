const {
  obtenerSucursalesService,
  obtenerSucursalPorIdService,
  crearSucursalService,
  actualizarSucursalService,
  eliminarSucursalService,
} = require("../services/sucursales.service");

const obtenerSucursales = async (req, res) => {
  try {
    const data =
      await obtenerSucursalesService();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const obtenerSucursalPorId = async (
  req,
  res
) => {
  try {
    const data =
      await obtenerSucursalPorIdService(
        req.params.id
      );

    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const crearSucursal = async (
  req,
  res
) => {
  try {
    const data =
      await crearSucursalService(
        req.body
      );

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const actualizarSucursal = async (
  req,
  res
) => {
  try {
    const data =
      await actualizarSucursalService(
        req.params.id,
        req.body
      );

    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const eliminarSucursal = async (
  req,
  res
) => {
  try {
    await eliminarSucursalService(
      req.params.id
    );

    res.json({
      mensaje:
        "Sucursal eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  obtenerSucursales,
  obtenerSucursalPorId,
  crearSucursal,
  actualizarSucursal,
  eliminarSucursal,
};