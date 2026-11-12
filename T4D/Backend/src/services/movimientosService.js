const pool = require("../config/db");
const { insertar } = require("../utils/sql");

// =====================================
// GET
// =====================================
const obtenerMovimientosService = async () => {
  const { rows } = await pool.query(`
    SELECT
      m.id_movimiento,
      m.fecha_movimiento,
      m.tipo_movimiento,
      m.cantidad,
      m.observacion,
      CASE WHEN p.id_producto IS NULL THEN NULL ELSE json_build_object(
        'id_producto', p.id_producto,
        'nombre_producto', p.nombre_producto
      ) END AS productos,
      CASE WHEN u.id_usuario IS NULL THEN NULL ELSE json_build_object(
        'id_usuario', u.id_usuario,
        'username', u.username
      ) END AS usuarios
    FROM movimientos_inventario m
    LEFT JOIN productos p ON p.id_producto = m.id_producto
    LEFT JOIN usuarios u ON u.id_usuario = m.id_usuario
    ORDER BY m.fecha_movimiento DESC
  `);
  return rows;
};

// =====================================
// POST
// =====================================
const crearMovimientoService = async (movimiento) => {
  return insertar("movimientos_inventario", movimiento);
};

module.exports = {
  obtenerMovimientosService,
  crearMovimientoService,
};
