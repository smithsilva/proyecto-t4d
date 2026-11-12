const pool = require("../config/db");
const { insertar, actualizar } = require("../utils/sql");

// Mapeo id_rol (numérico, viene del token JWT) -> nombre de rol tal como se
// guarda en la columna rol_destino de la tabla notificaciones. Debe
// coincidir EXACTAMENTE con los valores usados en login_screen.dart:
// 1 = Admin, 2 = Contadora, 3 = Gerente, 4 = Mecanico
const ROLES_POR_ID = {
  1: "Admin",
  2: "Contadora",
  3: "Gerente",
  4: "Mecanico",
};

// =====================================
// LECTURA
// =====================================

const obtenerNotificacionesPorRol = async (idRol) => {
  const rolNombre = ROLES_POR_ID[idRol];

  if (!rolNombre) {
    const err = new Error("Rol no reconocido");
    err.status = 400;
    throw err;
  }

  const { rows } = await pool.query(
    "SELECT * FROM notificaciones WHERE rol_destino = $1 ORDER BY fecha DESC",
    [rolNombre]
  );
  return rows;
};

// =====================================
// MARCAR LEÍDA
// =====================================

const marcarNotificacionLeida = async (id) => {
  const [notificacion] = await actualizar("notificaciones", "id_notificacion", id, {
    leido: true,
  });

  if (!notificacion) {
    throw new Error("Notificación no encontrada");
  }

  return notificacion;
};

// =====================================
// CREACIÓN (uso interno)
// =====================================

const crearNotificacion = async ({
  titulo,
  descripcion,
  rol_destino,
  id_usuario = null,
  id_asignacion = null,
}) => {
  try {
    const [data] = await insertar("notificaciones", {
      titulo,
      descripcion,
      rol_destino,
      id_usuario,
      id_asignacion,
      leido: false,
      fecha: new Date().toISOString(),
    });
    return data;
  } catch (error) {
    // No relanzamos: una notificación fallida no debería tumbar la operación principal
    console.error("ERROR CREAR NOTIFICACION:", error.message);
    return undefined;
  }
};

// Envía la misma notificación a varios roles a la vez (broadcast)
const crearNotificacionBroadcast = async ({ titulo, descripcion, roles }) => {
  const filas = roles.map((rol) => ({
    titulo,
    descripcion,
    rol_destino: rol,
    leido: false,
    fecha: new Date().toISOString(),
  }));

  return insertar("notificaciones", filas);
};

module.exports = {
  ROLES_POR_ID,
  obtenerNotificacionesPorRol,
  marcarNotificacionLeida,
  crearNotificacion,
  crearNotificacionBroadcast,
};
