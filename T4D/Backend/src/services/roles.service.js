const pool = require("../config/db");

const obtenerRoles = async () => {
  const { rows } = await pool.query("SELECT * FROM roles ORDER BY id_rol ASC");
  return rows;
};

const obtenerRolPorId = async (id) => {
  const { rows } = await pool.query("SELECT * FROM roles WHERE id_rol = $1", [id]);
  return rows[0];
};

const crearRol = async ({ nombre_rol, descripcion, nivel_acceso }) => {
  const { rows } = await pool.query(
    "INSERT INTO roles (nombre_rol, descripcion, nivel_acceso) VALUES ($1, $2, $3) RETURNING *",
    [nombre_rol, descripcion, nivel_acceso]
  );
  return rows[0];
};

const actualizarRol = async (id, { nombre_rol, descripcion, nivel_acceso }) => {
  const { rows } = await pool.query(
    "UPDATE roles SET nombre_rol = $1, descripcion = $2, nivel_acceso = $3 WHERE id_rol = $4 RETURNING *",
    [nombre_rol, descripcion, nivel_acceso, id]
  );
  return rows[0];
};

const eliminarRol = async (id) => {
  await pool.query("DELETE FROM roles WHERE id_rol = $1", [id]);
  return true;
};

module.exports = {
  obtenerRoles,
  obtenerRolPorId,
  crearRol,
  actualizarRol,
  eliminarRol,
};
