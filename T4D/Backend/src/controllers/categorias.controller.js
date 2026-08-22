const {
  obtenerCategorias,
  agregarCategoria,
  editarCategoria,
  actualizarParcialCategoria,
  eliminarCategoria,
} = require("../services/categorias.service");

// =====================================
// GET
// =====================================

const getCategorias = async (req, res) => {
  try {
    const categorias = await obtenerCategorias();
    res.json(categorias);
  } catch (error) {
    console.error("ERROR GET CATEGORIAS:", error);
    res.status(500).json({ error: error.message, detalle: error });
  }
};

// =====================================
// POST
// =====================================

const postCategoria = async (req, res) => {
  try {
    const categoria = await agregarCategoria(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    console.error("ERROR POST CATEGORIA:", error);
    res.status(500).json({ error: error.message, detalle: error });
  }
};

// =====================================
// PUT
// =====================================

const putCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await editarCategoria(id, req.body);
    res.json(categoria);
  } catch (error) {
    console.error("ERROR PUT CATEGORIA:", error);
    res.status(500).json({ error: error.message, detalle: error });
  }
};

// =====================================
// PATCH
// =====================================

const patchCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await actualizarParcialCategoria(id, req.body);
    res.json(categoria);
  } catch (error) {
    console.error("ERROR PATCH CATEGORIA:", error);
    res.status(500).json({ error: error.message, detalle: error });
  }
};

// =====================================
// DELETE
// =====================================

const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarCategoria(id);
    res.json({ message: "Categoría eliminada" });
  } catch (error) {
    console.error("ERROR DELETE CATEGORIA:", error);
    res.status(500).json({ error: error.message, detalle: error });
  }
};

module.exports = {
  getCategorias,
  postCategoria,
  putCategoria,
  patchCategoria,
  deleteCategoria,
};