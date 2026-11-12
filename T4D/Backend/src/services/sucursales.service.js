const pool = require("../config/db");
const { insertar, actualizar } = require("../utils/sql");

const obtenerSucursalesService = async () => {
  const { rows } = await pool.query("SELECT * FROM sucursales ORDER BY id_sucursal ASC");
  return rows;
};

const obtenerSucursalPorIdService = async (id) => {
  const { rows } = await pool.query("SELECT * FROM sucursales WHERE id_sucursal = $1", [id]);
  if (rows.length === 0) {
    throw new Error("Sucursal no encontrada");
  }
  return rows[0];
};

const crearSucursalService = async (sucursal) => {
  return insertar("sucursales", sucursal);
};

const actualizarSucursalService = async (id, sucursal) => {
  return actualizar("sucursales", "id_sucursal", id, sucursal);
};

const actualizarParcialSucursalService = async (id, datos) => {
  return actualizar("sucursales", "id_sucursal", id, datos);
};

const eliminarSucursalService = async (id) => {
  await pool.query("DELETE FROM sucursales WHERE id_sucursal = $1", [id]);
  return true;
};

module.exports = {
  obtenerSucursalesService,
  obtenerSucursalPorIdService,
  crearSucursalService,
  actualizarSucursalService,
  actualizarParcialSucursalService,
  eliminarSucursalService,
};
