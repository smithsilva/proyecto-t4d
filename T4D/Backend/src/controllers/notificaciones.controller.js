const {
  obtenerNotificacionesPorRol,
  marcarNotificacionLeida,
  crearNotificacionBroadcast,
} = require("../services/notificaciones.service");

// =====================================
// GET /notificaciones
// Devuelve solo las notificaciones del rol del usuario autenticado.
// El rol se toma del TOKEN (req.usuario.id_rol), nunca de un parámetro
// enviado por el cliente, para que un usuario no pueda pedir notificaciones
// de otro rol simplemente cambiando un query param.
// =====================================
const getNotificaciones = async (req, res) => {
  try {
    const notificaciones = await obtenerNotificacionesPorRol(req.usuario.id_rol);
    res.json(notificaciones);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, detalle: error });
  }
};

// =====================================
// PATCH /notificaciones/:id/leida
// =====================================
const patchLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await marcarNotificacionLeida(id);
    res.json(notificacion);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, detalle: error });
  }
};

// =====================================
// POST /notificaciones
// Envía un mensaje manual a TODOS los roles (equivalente al botón
// "Nueva notificación" / "+ Mensaje" del panel web).
// =====================================
const postBroadcast = async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: "titulo y descripcion son obligatorios" });
    }

    const roles = ["Admin", "Gerente", "Contadora", "Mecanico"];
    const data = await crearNotificacionBroadcast({ titulo, descripcion, roles });
    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, detalle: error });
  }
};

module.exports = {
  getNotificaciones,
  patchLeida,
  postBroadcast,
};