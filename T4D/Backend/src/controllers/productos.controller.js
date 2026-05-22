const {
  obtenerProductos,
} = require("../services/productos.service");

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

module.exports = {
  getProductos,
};