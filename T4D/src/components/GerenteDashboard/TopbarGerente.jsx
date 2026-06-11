import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Bell, User } from "lucide-react";
import { supabase } from "../../supabase/supabaseClient"; // ajusta la ruta

function TopbarGerente({ setVistaGerente, usuario }) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  // =====================================
  // CARGAR NOTIFICACIONES
  // =====================================

  const cargarNotificaciones = async () => {
    const { data, error } = await supabase
      .from("notificaciones")
      .select("*")
      .eq("rol_destino", "Gerente")
      .order("fecha", { ascending: false });

    if (!error) setNotificaciones(data || []);
  };

  useEffect(() => {
    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 15000);
    return () => clearInterval(intervalo);
  }, []);

  // =====================================
  // MARCAR COMO LEÍDA
  // =====================================

  const marcarLeida = async (id) => {
    await supabase
      .from("notificaciones")
      .update({ leido: true })
      .eq("id_notificacion", id);

    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === id ? { ...n, leido: true } : n
      )
    );
  };

  // =====================================
  // CERRAR SESIÓN
  // =====================================

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");

    Swal.fire({
      icon: "success",
      title: "Sesión cerrada",
      timer: 1500,
      showConfirmButton: false,
    });

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  const fmtFecha = (f) => {
    if (!f) return "";
    return new Date(f).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header
      className="d-flex justify-content-between align-items-center p-3 position-relative"
      style={{
        background: "#0b0b0b",
        borderBottom: "1px solid #8c6b3f",
        color: "#fff",
      }}
    >
      <h6 className="mb-0 fw-bold">Panel Gerente</h6>

      <div className="d-flex align-items-center gap-3">

        {/* 🔔 NOTIFICACIONES */}
        <div className="position-relative">
          <button
            onClick={() => {
              setOpenNotif(!openNotif);
              if (!openNotif) cargarNotificaciones();
            }}
            style={{
              background: "#1a1a1a",
              border: "1px solid #8c6b3f",
              padding: "8px",
              borderRadius: "50%",
              cursor: "pointer",
              position: "relative",
              color: "#fff",
            }}
          >
            <Bell size={20} />

            {noLeidas > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "#8c6b3f",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "10px",
                  padding: "2px 6px",
                  minWidth: 18,
                  textAlign: "center",
                }}
              >
                {noLeidas}
              </span>
            )}
          </button>

          {openNotif && (
            <div
              className="position-absolute end-0 mt-2 p-3 rounded-4"
              style={{
                width: "320px",
                zIndex: 1000,
                background: "#1a1a1a",
                border: "1px solid #8c6b3f",
                color: "#fff",
                maxHeight: "460px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <strong style={{ fontSize: 14 }}>Notificaciones</strong>
                {noLeidas > 0 && (
                  <span style={{ fontSize: 11, color: "#8c6b3f" }}>
                    {noLeidas} sin leer
                  </span>
                )}
              </div>

              {notificaciones.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    fontSize: 13,
                    padding: "20px 0",
                  }}
                >
                  No hay notificaciones
                </div>
              ) : (
                notificaciones.slice(0, 5).map((n) => (
                  <div
                    key={n.id_notificacion}
                    style={{
                      background: "#0b0b0b",
                      padding: "10px",
                      borderRadius: "10px",
                      marginBottom: 10,
                      border: `1px solid ${n.leido ? "#222" : "#8c6b3f"}`,
                      opacity: n.leido ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <strong style={{ color: "#b89b6a", fontSize: 13 }}>
                        {n.titulo}
                      </strong>
                      {!n.leido && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#b89b6a",
                            display: "inline-block",
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                        />
                      )}
                    </div>

                    <p style={{ fontSize: 12, margin: "4px 0", color: "#ccc" }}>
                      {n.descripcion}
                    </p>

                    <small style={{ color: "#666", fontSize: 11 }}>
                      {fmtFecha(n.fecha)}
                    </small>

                    {!n.leido && (
                      <button
                        onClick={() => marcarLeida(n.id_notificacion)}
                        style={{
                          marginTop: 8,
                          width: "100%",
                          background: "#1a1a1a",
                          border: "1px solid #8c6b3f",
                          padding: "6px",
                          borderRadius: "8px",
                          fontSize: 11,
                          cursor: "pointer",
                          color: "#b89b6a",
                        }}
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                ))
              )}

              <button
                onClick={() => {
                  setVistaGerente("notificaciones");
                  setOpenNotif(false);
                }}
                style={{
                  width: "100%",
                  background: "#8c6b3f",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "10px",
                  marginTop: "6px",
                  cursor: "pointer",
                }}
              >
                Ver todas
              </button>
            </div>
          )}
        </div>

        {/* 👤 PERFIL */}
        <div className="position-relative">
          <div
            onClick={() => setMostrarMenu(!mostrarMenu)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              overflow: "hidden",
              cursor: "pointer",
              background: "#8c6b3f",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "14px",
              border: "2px solid #B89B6A",
            }}
          >
            {usuario?.foto ? (
              <img
                src={usuario.foto}
                alt="perfil"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              usuario?.nombre?.slice(0, 2).toUpperCase()
            )}
          </div>

          {mostrarMenu && (
            <div
              className="position-absolute end-0 mt-2 p-3 rounded-4"
              style={{
                width: "220px",
                zIndex: 1000,
                background: "#1a1a1a",
                border: "1px solid #8c6b3f",
                color: "#fff",
              }}
            >
              <div className="text-center mb-2">
                <div className="fw-bold">{usuario?.nombre}</div>
                <small style={{ color: "#cfcfcf" }}>{usuario?.rol}</small>
              </div>

              <hr style={{ borderColor: "#333" }} />

              <button
                onClick={() => {
                  setVistaGerente("perfil");
                  setMostrarMenu(false);
                }}
                className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "#0b0b0b",
                  color: "#fff",
                  border: "1px solid #333",
                  padding: "6px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <User size={16} />
                Mi Perfil
              </button>

              <button
                onClick={cerrarSesion}
                className="w-100 rounded-pill"
                style={{
                  background: "#8c3f3f",
                  color: "#fff",
                  border: "none",
                  padding: "6px",
                  cursor: "pointer",
                }}
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

export default TopbarGerente;