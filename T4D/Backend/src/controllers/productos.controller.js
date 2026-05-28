const {
  obtenerProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto,
} = require("../services/productos.service");

// =====================================
// GET
// =====================================

const getProductos = async (req, res) => {

  try {

    const productos =
      await obtenerProductos();

    res.json(productos);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error al obtener productos",
    });

  }

};

// =====================================
// POST
// =====================================

const postProducto = async (
  req,
  res
) => {

  try {

    const producto =
      await agregarProducto(req.body);

    res.status(201).json(producto);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error al agregar producto",
    });

  }

};

// =====================================
// PUT
// =====================================

const putProducto = async (
  req,
  res
) => {

  try {

    const id = req.params.id;

    const producto =
      await editarProducto(
        id,
        req.body
      );

    res.json(producto);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error al editar producto",
    });

  }

};

// =====================================
// DELETE
// =====================================

const deleteProducto = async (
  req,
  res
) => {

  try {

    const id = req.params.id;

    await eliminarProducto(id);

    res.json({
      message: "Producto eliminado",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error al eliminar producto",
    });

  }

};

module.exports = {
  getProductos,
  postProducto,
  putProducto,
  deleteProducto,
};