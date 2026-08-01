const {
  obtenerProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto,
  actualizarParcialProducto,
} = require("../services/productos.service");

// =====================================
// GET
// =====================================

const getProductos = async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.json(productos);
  } catch (error) {
    console.error("ERROR GET PRODUCTOS:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// POST
// =====================================

const postProducto = async (req, res) => {
  try {
    const producto = await agregarProducto(req.body);

    res.status(201).json(producto);
  } catch (error) {
    console.error("ERROR POST PRODUCTO:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// PUT
// =====================================

const putProducto = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID recibido:", id);
    console.log("BODY recibido:", req.body);

    const producto = await editarProducto(id, req.body);

    res.json(producto);
  } catch (error) {
    console.error("ERROR PUT PRODUCTO:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// PATCH
// =====================================

const patchProducto = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID recibido:", id);
    console.log("BODY recibido:", req.body);

    const producto = await actualizarParcialProducto(id, req.body);

    res.json(producto);
  } catch (error) {
    console.error("ERROR PATCH PRODUCTO:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// PATCH STOCK (solo cantidad, para Mecánico)
// =====================================

const patchStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body; // 👈 ajusta el nombre del campo si tu columna se llama distinto

    console.log("ID recibido:", id);
    console.log("STOCK recibido:", stock);

    if (stock === undefined) {
      return res.status(400).json({
        error: "Debes enviar el campo 'stock'",
      });
    }

    // Solo se actualiza el campo stock, sin importar qué más venga en el body
    const producto = await actualizarParcialProducto(id, { stock });

    res.json(producto);
  } catch (error) {
    console.error("ERROR PATCH STOCK:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// DELETE
// =====================================

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    await eliminarProducto(id);

    res.json({
      message: "Producto eliminado",
    });
  } catch (error) {
    console.error("ERROR DELETE PRODUCTO:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

module.exports = {
  getProductos,
  postProducto,
  putProducto,
  patchProducto,
  patchStock,
  deleteProducto,
};