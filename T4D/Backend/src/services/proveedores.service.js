const pool = require("../config/db");
const { insertar, actualizar } = require("../utils/sql");

const obtenerProveedores = async () => {
  const { rows } = await pool.query("SELECT * FROM proveedores ORDER BY id_proveedor ASC");
  return rows;
};

const agregarProveedor = async (proveedor) => {
  return insertar("proveedores", proveedor);
};

const actualizarProveedor = async (id, proveedor) => {
  return actualizar("proveedores", "id_proveedor", id, proveedor);
};

const actualizarParcialProveedor = async (id, datos) => {
  return actualizar("proveedores", "id_proveedor", id, datos);
};

const eliminarProveedor = async (id) => {
  await pool.query("DELETE FROM proveedores WHERE id_proveedor = $1", [id]);
};

module.exports = {
  obtenerProveedores,
  agregarProveedor,
  actualizarProveedor,
  actualizarParcialProveedor,
  eliminarProveedor,
};
