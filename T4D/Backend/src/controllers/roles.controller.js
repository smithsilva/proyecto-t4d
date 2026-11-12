const pool = require("../config/db");

// ======================================
// OBTENER ROLES
// ======================================
const obtenerRoles = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM roles ORDER BY id_rol ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerRoles,
};
