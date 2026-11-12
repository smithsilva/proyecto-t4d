const pool = require("../config/db");
const { insertar, actualizar } = require("../utils/sql");

const obtenerCategorias = async () => {
  const { rows } = await pool.query("SELECT * FROM categorias ORDER BY id_categoria ASC");
  return rows;
};

const agregarCategoria = async (categoria) => {
  return insertar("categorias", categoria);
};

const editarCategoria = async (id, categoria) => {
  return actualizar("categorias", "id_categoria", id, categoria);
};

const actualizarParcialCategoria = async (id, datos) => {
  return actualizar("categorias", "id_categoria", id, datos);
};

const eliminarCategoria = async (id) => {
  await pool.query("DELETE FROM categorias WHERE id_categoria = $1", [id]);
  return true;
};

module.exports = {
  obtenerCategorias,
  agregarCategoria,
  editarCategoria,
  actualizarParcialCategoria,
  eliminarCategoria,
};
