import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabaseClient";

// Paleta Defensa Élite
const NAVY         = "#0d1b2a";
const NAVY_OSCURO  = "#091420";
const DORADO       = "#c9a25a";
const DORADO_SUAVE = "#b89b6a";

function TopbarAdmin({ setVistaAdmin, usuario }) {
  const [mostrarMenu,    setMostrarMenu]    = useState(false);
  const [openNotif,      setOpenNotif]      = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  const cargarNotificaciones = async () => {
    const { data, error } = await supabase
      .from("notificaciones")
      .select("*")
      .eq("rol_destino", "Admin")
      .order("fecha", { ascending: false });
    if (!error) setNotificaciones(data || []);
  };

  useEffect(() => {
    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 15000);
    return () => clearInterval(intervalo);
  }, []);

  const marcarLeida = async (id) => {
    await supabase.from("notificaciones").update({ leido: true }).eq("id_notificacion", id);
    setNotificaciones((prev) =>
      prev.map((n) => n.id_notificacion === id ? { ...n, leido: true } : n)
    );
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    Swal.fire({ icon: "success", title: "Sesión cerrada", timer: 1500, showConfirmButton: false });
    setTimeout(() => { window.location.href = "/"; }, 1500);
  };

  const noLeidas = notificaciones.filter((n) => !n.leido).length;
  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <header
      style={{
        background:     NAVY,
        borderBottom:   `2px solid ${DORADO}`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",   /* ← espacio entre título y controles */
        padding:        "0 28px",
        height:         "72px",
        position:       "relative",
      }}
    >
      {/* ══ IZQUIERDA: título Panel de Administrador ══ */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Línea decorativa dorada */}
        <div style={{ width: "3px", height: "32px", background: DORADO, borderRadius: "2px" }} />
        <div>
          <div style={{ color: DORADO, fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", lineHeight: 1 }}>
            Bienvenido
          </div>
          <div style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700, letterSpacing: "0.5px", lineHeight: 1.3 }}>
            Panel de Administrador
          </div>
        </div>
      </div>

      {/* ══ DERECHA: campana + perfil ══ */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>

        {/* 🔔 Campana */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setOpenNotif(!openNotif); if (!openNotif) cargarNotificaciones(); }}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px", color: DORADO_SUAVE, display: "flex", alignItems: "center", position: "relative" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DORADO_SUAVE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {noLeidas > 0 && (
              <span style={{ position: "absolute", top: "2px", right: "2px", background: DORADO, color: "#1a1a1a", borderRadius: "50%", fontSize: "11px", fontWeight: 700, padding: "2px 6px", minWidth: 19, textAlign: "center" }}>
                {noLeidas}
              </span>
            )}
          </button>

          {openNotif && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "340px", zIndex: 1000, background: NAVY_OSCURO, border: `1px solid ${DORADO}`, borderRadius: "12px", padding: "18px", color: "#fff", maxHeight: "440px", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: 15 }}>Notificaciones</strong>
                {noLeidas > 0 && <span style={{ fontSize: 12, color: DORADO }}>{noLeidas} sin leer</span>}
              </div>
              {notificaciones.length === 0 ? (
                <div style={{ textAlign: "center", color: "#aaa", fontSize: 14, padding: "20px 0" }}>No hay notificaciones</div>
              ) : (
                notificaciones.slice(0, 5).map((n) => (
                  <div key={n.id_notificacion} style={{ background: NAVY, padding: "12px", borderRadius: "10px", marginBottom: 10, border: `1px solid ${n.leido ? "#1c2a3a" : DORADO}`, opacity: n.leido ? 0.6 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <strong style={{ color: DORADO_SUAVE, fontSize: 14 }}>{n.titulo}</strong>
                      {!n.leido && <span style={{ width: 8, height: 8, borderRadius: "50%", background: DORADO_SUAVE, display: "inline-block", flexShrink: 0, marginTop: 3 }} />}
                    </div>
                    <p style={{ fontSize: 13, margin: "4px 0", color: "#ccc" }}>{n.descripcion}</p>
                    <small style={{ color: "#7b8a99", fontSize: 12 }}>{fmtFecha(n.fecha)}</small>
                    {!n.leido && (
                      <button onClick={() => marcarLeida(n.id_notificacion)} style={{ marginTop: 8, width: "100%", background: NAVY_OSCURO, border: `1px solid ${DORADO}`, padding: "7px", borderRadius: "8px", fontSize: 12, cursor: "pointer", color: DORADO_SUAVE }}>
                        Marcar como leída
                      </button>
                    )}
                  </div>
                ))
              )}
              <button onClick={() => { setVistaAdmin("notificaciones"); setOpenNotif(false); }}
                style={{ width: "100%", background: DORADO, color: "#1a1a1a", fontWeight: 600, border: "none", padding: "11px", borderRadius: "10px", marginTop: "6px", cursor: "pointer", fontSize: 14 }}>
                Ver todas
              </button>
            </div>
          )}
        </div>

        {/* 👤 Perfil — avatar ícono + nombre + rol + flecha */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setMostrarMenu(!mostrarMenu)}
            style={{ display: "flex", alignItems: "center", gap: "11px", cursor: "pointer", padding: "6px 14px", borderRadius: "36px", border: `1px solid ${DORADO}44`, transition: "background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,162,90,0.10)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {/* Avatar circular con ícono de persona */}
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: `${DORADO}22`, border: `1.5px solid ${DORADO}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {usuario?.foto ? (
                <img src={usuario.foto} alt="perfil" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DORADO} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>

            {/* Nombre + Rol */}
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" }}>
                {usuario?.nombre || "Usuario"}
              </div>
              <div style={{ color: DORADO_SUAVE, fontSize: "12px", textTransform: "capitalize" }}>
                {usuario?.rol || "Admin"}
              </div>
            </div>

            {/* Flecha desplegable */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DORADO_SUAVE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {/* Dropdown perfil */}
          {mostrarMenu && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "240px", zIndex: 1000, background: NAVY_OSCURO, border: `1px solid ${DORADO}`, borderRadius: "12px", padding: "18px", color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <div style={{ fontWeight: 700, fontSize: "16px" }}>{usuario?.nombre}</div>
                <div style={{ color: DORADO_SUAVE, fontSize: "13px", textTransform: "capitalize" }}>{usuario?.rol}</div>
              </div>
              <hr style={{ borderColor: "#1c2a3a", margin: "10px 0" }} />
              <button onClick={() => { setVistaAdmin("perfil"); setMostrarMenu(false); }}
                style={{ width: "100%", background: NAVY, color: "#fff", border: "1px solid #1c2a3a", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", marginBottom: "8px" }}>
                Mi Perfil
              </button>
              <button onClick={cerrarSesion}
                style={{ width: "100%", background: "#8c3f3f", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "14px" }}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopbarAdmin;