import { supabase } from "../../Supabase/SupabaseClient";

/**
 * Envía una notificación a uno o varios roles insertándola en la tabla
 * `notificaciones`. Coincide con las columnas reales de la tabla:
 * titulo | descripcion | fecha | leido | rol_destino | id_usuario | id_asignacion
 *
 * @param {Object} params
 * @param {string} params.titulo - Título/asunto de la notificación.
 * @param {string} params.descripcion - Contenido del mensaje.
 * @param {string[]} params.roles - Roles destino, ej: ["Admin", "Gerente"].
 *   Se inserta una fila por cada rol (broadcast).
 * @param {number} [params.id_usuario] - Opcional: usuario específico destino.
 * @param {number} [params.id_asignacion] - Opcional: asignación relacionada.
 */
export async function enviarNotificacion({
  titulo,
  descripcion,
  roles = [],
  id_usuario = null,
  id_asignacion = null,
}) {
  if (!titulo || !descripcion) {
    throw new Error("titulo y descripcion son obligatorios");
  }
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error("Debes indicar al menos un rol destino en 'roles'");
  }

  const filas = roles.map((rol) => ({
    titulo,
    descripcion,
    rol_destino: rol,
    id_usuario,
    id_asignacion,
    leido: false,
    fecha: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("notificaciones")
    .insert(filas)
    .select();

  if (error) {
    console.error("Error al enviar notificación:", error.message);
    throw error;
  }

  return data;
}