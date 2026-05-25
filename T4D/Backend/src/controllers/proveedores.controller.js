const {
  obtenerProveedoresService,
  crearProveedorService,
  actualizarProveedorService,
  eliminarProveedorService,
} = require("../services/proveedores.service");

// OBTENER
const obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await obtenerProveedoresService();

    res.json({
      ok: true,
      proveedores,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: error.message,
    });
  }
};

// CREAR
const crearProveedor = async (req, res) => {
  try {
    const proveedor = await crearProveedorService(req.body);

    res.status(201).json({
      ok: true,
      proveedor,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: error.message,
    });
  }
};

// ACTUALIZAR
const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedor = await actualizarProveedorService(
      id,
      req.body
    );

    res.json({
      ok: true,
      proveedor,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: error.message,
    });
  }
};

// ELIMINAR
const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    await eliminarProveedorService(id);

    res.json({
      ok: true,
      mensaje: "Proveedor eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: error.message,
    });
  }
};

module.exports = {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};