import { supabase } from "../Supabase/SupabaseClient"; // ajusta la ruta

/**
 * Envía una notificación a uno o varios roles.
 *
 * @param {Object} params
 * @param {string}   params.titulo       - Título de la notificación
 * @param {string}   params.descripcion  - Descripción / cuerpo
 * @param {string|string[]} params.roles - Rol(es) destino: "Admin" | "Gerente" | "Contadora" | "Mecanico"
 * @param {number}   [params.id_usuario] - ID del usuario específico (solo para Mecánico)
 * @param {number}   [params.id_asignacion] - ID de asignación relacionada (opcional)
 *
 * @example
 * // Notificar al Gerente y Admin
 * await enviarNotificacion({
 *   titulo: "Nueva solicitud",
 *   descripcion: "Se registró un nuevo movimiento",
 *   roles: ["Gerente", "Admin"],
 * });
 *
 * @example
 * // Notificar a un mecánico específico
 * await enviarNotificacion({
 *   titulo: "Nueva asignación",
 *   descripcion: "Tienes un nuevo trabajo asignado",
 *   roles: "Mecanico",
 *   id_usuario: 57,
 *   id_asignacion: 12,
 * });
 */
export const enviarNotificacion = async ({
  titulo,
  descripcion,
  roles,
  id_usuario = null,
  id_asignacion = null,
}) => {
  const rolesArray = Array.isArray(roles) ? roles : [roles];

  const registros = rolesArray.map((rol) => ({
    titulo,
    descripcion,
    rol_destino: rol,
    id_usuario,
    id_asignacion,
    leido: false,
    fecha: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("notificaciones")
    .insert(registros);

  if (error) {
    console.error("Error al enviar notificación:", error.message);
  }
};