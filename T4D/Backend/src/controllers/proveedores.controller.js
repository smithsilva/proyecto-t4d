const {
  obtenerProveedores,
  agregarProveedor,
  actualizarProveedor,
  eliminarProveedor,
} = require("../services/proveedores.service");

// =====================================
// GET
// =====================================

const getProveedores = async (
  req,
  res
) => {

  try {

    const proveedores =
      await obtenerProveedores();

    res.json(proveedores);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

// =====================================
// POST
// =====================================

const postProveedor = async (
  req,
  res
) => {

  try {

    const proveedor =
      await agregarProveedor(
        req.body
      );

    res.status(201).json(
      proveedor
    );

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

// =====================================
// PUT
// =====================================

const putProveedor = async (
  req,
  res
) => {

  try {

    const id = req.params.id;

    const proveedor =
      await actualizarProveedor(
        id,
        req.body
      );

    res.json(proveedor);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

// =====================================
// DELETE
// =====================================

const deleteProveedor = async (
  req,
  res
) => {

  try {

    const id = req.params.id;

    await eliminarProveedor(id);

    res.json({
      success: true,
      message:
        "Proveedor eliminado",
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

module.exports = {
  getProveedores,
  postProveedor,
  putProveedor,
  deleteProveedor,
}