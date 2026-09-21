const supabase = require("../config/supabase");

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

  const { data, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("rol_destino", rolNombre)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("ERROR SUPABASE GET NOTIFICACIONES:", error);
    throw error;
  }

  return data;
};

// =====================================
// MARCAR LEÍDA
// =====================================

const marcarNotificacionLeida = async (id) => {
  const { data, error } = await supabase
    .from("notificaciones")
    .update({ leido: true })
    .eq("id_notificacion", id)
    .select()
    .single();

  if (error) {
    console.error("ERROR SUPABASE MARCAR LEIDA:", error);
    throw error;
  }

  return data;
};

// =====================================
// CREACIÓN (uso interno: llamada desde otros services cuando ocurre
// un evento como cambio de precio, stock bajo o movimiento)
// =====================================

const crearNotificacion = async ({
  titulo,
  descripcion,
  rol_destino,
  id_usuario = null,
  id_asignacion = null,
}) => {
  const { data, error } = await supabase
    .from("notificaciones")
    .insert([
      {
        titulo,
        descripcion,
        rol_destino,
        id_usuario,
        id_asignacion,
        leido: false,
        fecha: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    // No relanzamos como error fatal: una notificación fallida no debería
    // tumbar la operación principal (crear producto, registrar movimiento, etc.)
    console.error("ERROR SUPABASE CREAR NOTIFICACION:", error);
  }

  return data;
};

// Envía la misma notificación a varios roles a la vez (broadcast),
// equivalente a enviarNotificacion({...roles: [...]}) en el frontend web.
const crearNotificacionBroadcast = async ({ titulo, descripcion, roles }) => {
  const filas = roles.map((rol) => ({
    titulo,
    descripcion,
    rol_destino: rol,
    leido: false,
    fecha: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("notificaciones")
    .insert(filas)
    .select();

  if (error) {
    console.error("ERROR SUPABASE BROADCAST NOTIFICACIONES:", error);
    throw error;
  }

  return data;
};

module.exports = {
  ROLES_POR_ID,
  obtenerNotificacionesPorRol,
  marcarNotificacionLeida,
  crearNotificacion,
  crearNotificacionBroadcast,
};