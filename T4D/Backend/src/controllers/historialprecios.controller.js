const {
  obtenerProductos,
  editarProducto,
  cambiarEstadoProducto,
  obtenerHistorial,
  obtenerHistorialPorProducto,
} = require("../services/historialprecios.service");

// =====================================
// PRODUCTOS (solo lectura + actualización de precio)
// =====================================

const getProductos = async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message, detalle: error });
  }
};

const putProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_producto, precio_nuevo, motivo } = req.body;

    if (precio_nuevo !== undefined && (isNaN(Number(precio_nuevo)) || Number(precio_nuevo) <= 0)) {
      return res.status(400).json({ error: "precio_nuevo debe ser un número mayor a 0" });
    }

    const producto = await editarProducto(id, { nombre_producto, precio_nuevo, motivo });
    res.json(producto);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, detalle: error });
  }
};

const patchEstadoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== "boolean") {
      return res.status(400).json({ error: "activo debe ser true o false" });
    }

    const producto = await cambiarEstadoProducto(id, activo);
    res.json(producto);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, detalle: error });
  }
};

// =====================================
// HISTORIAL (solo lectura)
// =====================================

const getHistorial = async (req, res) => {
  try {
    const { id_producto } = req.query;
    const historial = id_producto
      ? await obtenerHistorialPorProducto(id_producto)
      : await obtenerHistorial();
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: error.message, detalle: error });
  }
};

module.exports = {
  getProductos,
  putProducto,
  patchEstadoProducto,
  getHistorial,
};