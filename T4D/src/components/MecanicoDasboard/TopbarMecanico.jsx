import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Bell, User } from "lucide-react";
import { supabase } from "../../supabase/supabaseClient"; // ajusta la ruta

function TopbarMecanico({ setVista, usuario }) {

  const [mostrarMenu,    setMostrarMenu]    = useState(false);
  const [openNotif,      setOpenNotif]      = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  // =====================================
  // CARGAR NOTIFICACIONES DESDE SUPABASE
  // Filtra por id_usuario del mecánico logueado
  // =====================================

  const cargarNotificaciones = async () => {
    if (!usuario?.id_usuario) return;

 // En cargarNotificaciones, actualiza el select:
const { data, error } = await supabase
  .from("notificaciones")
  .select(`
    id_notificacion,
    titulo,
    descripcion,
    fecha,
    leido,
    id_asignacion,
    asignaciones_tareas (
      id_asignacion,
      vehiculo,
      tipo_trabajo,
      descripcion,
      prioridad,
      fecha_limite,
      estado,
      costo,
      metodos_pago(
        nombre_metodo,
        permite_online
      )
    )
  `)
  .eq("id_usuario", usuario.id_usuario)
  .eq("rol_destino", "Mecanico")
  .order("fecha", { ascending: false });

    if (!error) setNotificaciones(data || []);
  };

  useEffect(() => {
    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 15000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  // =====================================
  // ACEPTAR TAREA
  // 1. Marca la notificación como leída
  // 2. Actualiza el estado de la asignación a "En proceso"
  // MisMantenimientos leerá directo de Supabase
  // =====================================

  const aceptarTarea = async (notif) => {
    // 1. Marcar notificación como leída
    await supabase
      .from("notificaciones")
      .update({ leido: true })
      .eq("id_notificacion", notif.id_notificacion);

    // 2. Cambiar estado de la asignación a "En proceso"
    if (notif.id_asignacion) {
      const { error } = await supabase
        .from("asignaciones_tareas")
        .update({ estado: "En proceso" })
        .eq("id_asignacion", notif.id_asignacion);

      if (error) console.error("Error actualizando asignación:", error.message);
    }

    // Actualiza estado local inmediatamente
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === notif.id_notificacion ? { ...n, leido: true } : n
      )
    );

    Swal.fire({
      icon: "success",
      title: "Tarea aceptada",
      text: "La tarea está ahora en proceso",
      confirmButtonColor: "#B89B6A",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // =====================================
  // CERRAR SESIÓN
  // =====================================

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario");
    Swal.fire({ icon: "success", title: "Sesión cerrada", timer: 1500, showConfirmButton: false });
    window.location.href = "/";
  };

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  const fmtFecha = (f) => {
    if (!f) return "";
    return new Date(f).toLocaleDateString("es-CO", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <header
      className="d-flex justify-content-between align-items-center p-3 position-relative"
      style={{ background: "#0b0b0b", borderBottom: "1px solid #8c6b3f", color: "#fff" }}
    >
      <h6 className="mb-0 fw-bold">Panel Mecánico</h6>

      <div className="d-flex align-items-center gap-3">

        {/* NOTIFICACIONES */}
        <div className="position-relative">
          <button
            onClick={() => { setOpenNotif(!openNotif); if (!openNotif) cargarNotificaciones(); }}
            style={{ background: "#1a1a1a", border: "1px solid #8c6b3f", padding: "8px", borderRadius: "50%", cursor: "pointer", position: "relative", color: "#fff" }}
          >
            <Bell size={20} />
            {noLeidas > 0 && (
              <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#8c6b3f", color: "#fff", borderRadius: "50%", fontSize: "10px", padding: "2px 6px", minWidth: 18, textAlign: "center" }}>
                {noLeidas}
              </span>
            )}
          </button>

          {openNotif && (
            <div
              className="position-absolute end-0 mt-2 p-3 rounded-4"
              style={{ width: "340px", zIndex: 1000, background: "#1a1a1a", border: "1px solid #8c6b3f", color: "#fff", maxHeight: "480px", overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: 14 }}>Notificaciones</strong>
                {noLeidas > 0 && <span style={{ fontSize: 11, color: "#8c6b3f" }}>{noLeidas} sin leer</span>}
              </div>

              {notificaciones.length === 0 ? (
                <div style={{ textAlign: "center", color: "#aaa", fontSize: 13, padding: "20px 0" }}>
                  No hay notificaciones
                </div>
              ) : (
                notificaciones.map((n) => (
                  <div key={n.id_notificacion} style={{
                    background: "#0b0b0b", padding: "12px", borderRadius: "10px", marginBottom: 10,
                    border: `1px solid ${n.leido ? "#222" : "#8c6b3f"}`,
                    opacity: n.leido ? 0.6 : 1,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <strong style={{ color: "#b89b6a", fontSize: 13 }}>{n.titulo}</strong>
                      {!n.leido && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#b89b6a", display: "inline-block", flexShrink: 0, marginTop: 3 }} />}
                    </div>

                    <p style={{ fontSize: 12, margin: "4px 0", color: "#ccc" }}>{n.descripcion}</p>

                    {/* Detalles de la asignación desde el JOIN */}
                  {n.asignaciones_tareas && (
  <div style={{ background: "#111", borderRadius: 8, padding: "8px 10px", marginTop: 6, fontSize: 11, color: "#aaa" }}>
    <p style={{ margin: "2px 0" }}>🚗 <strong style={{ color: "#fff" }}>{n.asignaciones_tareas.vehiculo}</strong></p>
    <p style={{ margin: "2px 0" }}>🔧 {n.asignaciones_tareas.tipo_trabajo}</p>
    {n.asignaciones_tareas.prioridad && (
      <p style={{ margin: "2px 0" }}>⚡ Prioridad: {n.asignaciones_tareas.prioridad}</p>
    )}
    {n.asignaciones_tareas.fecha_limite && (
      <p style={{ margin: "2px 0" }}>📅 Límite: {n.asignaciones_tareas.fecha_limite}</p>
    )}
    {/* ── NUEVO: costo y método de pago ── */}
    {n.asignaciones_tareas.costo != null && (
      <p style={{ margin: "2px 0" }}>
        💰 <strong style={{ color: "#b89b6a" }}>
          $ {Number(n.asignaciones_tareas.costo).toLocaleString("es-CO")}
        </strong>
      </p>
    )}
    {n.asignaciones_tareas.metodos_pago && (
      <p style={{ margin: "2px 0", display: "flex", alignItems: "center", gap: 4 }}>
        💳 {n.asignaciones_tareas.metodos_pago.nombre_metodo}
        <span style={{
          marginLeft: 6, fontSize: 10, padding: "1px 7px", borderRadius: 20, fontWeight: 600,
          background: n.asignaciones_tareas.metodos_pago.permite_online ? "#1e3a5f" : "#2a2a2a",
          color: n.asignaciones_tareas.metodos_pago.permite_online ? "#60a5fa" : "#9ca3af",
        }}>
          {n.asignaciones_tareas.metodos_pago.permite_online ? "Online" : "Presencial"}
        </span>
      </p>
    )}
  </div>
)}
                    <small style={{ color: "#666", fontSize: 11 }}>{fmtFecha(n.fecha)}</small>

                    {!n.leido && (
                      <button
                        onClick={() => aceptarTarea(n)}
                        style={{ marginTop: 10, width: "100%", background: "#B89B6A", border: "none", padding: "8px", borderRadius: "10px", fontSize: 12, fontWeight: "bold", cursor: "pointer", color: "#000" }}
                      >
                        Aceptar tarea
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* PERFIL */}
        <div className="position-relative">
          <div
            onClick={() => setMostrarMenu(!mostrarMenu)}
            style={{ width: "35px", height: "35px", borderRadius: "50%", backgroundColor: "#8c6b3f", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", overflow: "hidden" }}
          >
            {usuario?.foto
              ? <img src={usuario.foto} alt="perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : usuario?.nombre?.slice(0, 2).toUpperCase()
            }
          </div>

          {mostrarMenu && (
            <div
              className="position-absolute end-0 mt-2 p-3 rounded-4"
              style={{ width: "220px", zIndex: 1000, background: "#1a1a1a", border: "1px solid #8c6b3f", color: "#fff" }}
            >
              <div className="text-center mb-2">
                <div className="fw-bold">{usuario?.nombre}</div>
                <small style={{ color: "#cfcfcf" }}>{usuario?.rol}</small>
              </div>
              <hr style={{ borderColor: "#333" }} />
              <button
                onClick={() => { setVista("perfil"); setMostrarMenu(false); }}
                className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                style={{ background: "#0b0b0b", color: "#fff", border: "1px solid #333", padding: "6px", borderRadius: "10px", cursor: "pointer" }}
              >
                <User size={16} /> Mi Perfil
              </button>
              <button
                onClick={cerrarSesion}
                className="w-100 rounded-pill"
                style={{ background: "#8c3f3f", color: "#fff", border: "none", padding: "6px", cursor: "pointer" }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default TopbarMecanico;