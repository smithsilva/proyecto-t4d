import { supabase } from "../Supabase/supabaseClient";

/**
 * Envía una notificación insertándola en la tabla de notificaciones de Supabase.
 * @param {Object} params
 * @param {string} params.destinatario_id - UUID del usuario destinatario
 * @param {string} params.mensaje - Contenido de la notificación
 * @param {string} [params.tipo] - Tipo de notificación (ej: "info", "alerta", "sistema")
 * @param {string} [params.remitente_id] - UUID del usuario que envía (opcional)
 */
export async function enviarNotificacion({
  destinatario_id,
  mensaje,
  tipo = "info",
  remitente_id = null,
}) {
  const { data, error } = await supabase
    .from("notificaciones")
    .insert([
      {
        destinatario_id,
        mensaje,
        tipo,
        remitente_id,
        leida: false,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error("Error al enviar notificación:", error.message);
    throw error;
  }

  return data;
}