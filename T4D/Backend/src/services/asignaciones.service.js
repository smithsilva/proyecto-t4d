const pool = require("../config/db");

const obtenerAsignaciones = async () => {
  const { rows: asignaciones } = await pool.query(
    "SELECT * FROM asignaciones_tareas ORDER BY fecha_asignacion DESC"
  );

  const ids = [...new Set(asignaciones.map((a) => a.id_mecanico))].filter(
    (id) => id !== null && id !== undefined
  );

  const { rows: usuarios } = ids.length
    ? await pool.query(
        "SELECT id_usuario, username FROM usuarios WHERE id_usuario = ANY($1)",
        [ids]
      )
    : { rows: [] };

  const usuariosMap = Object.fromEntries(usuarios.map((u) => [u.id_usuario, u]));

  return asignaciones.map((a) => ({
    ...a,
    usuarios: usuariosMap[a.id_mecanico] || null,
  }));
};

module.exports = { obtenerAsignaciones };
