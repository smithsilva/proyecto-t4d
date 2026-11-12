const pool = require("../config/db");

const obtenerUsuarios = async () => {
  const { rows } = await pool.query("SELECT * FROM usuarios");
  return rows.map(({ password_hash, reset_code, reset_code_expires, ...u }) => u);
};

module.exports = {
  obtenerUsuarios,
};
