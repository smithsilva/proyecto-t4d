import { useState, useEffect } from "react";
import { Bell, Inbox, Send, X, Filter } from "lucide-react";
import { supabase } from "../../Supabase/supabaseClient"; // ajusta la ruta
import { enviarNotificacion } from "../../utils/notificaciones.helper";

// =========================================
// PALETA (igual a Inventario.jsx)
// =========================================
const DORADO = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO = "#e7c98a";
const FONDO = "#f7f1e3";
const ENCABEZADO = "#13202e";
const TEXTO_ENCABEZADO = "#e7c98a";

function Notificaciones({ usuario }) {
  const [filtro, setFiltro] = useState("todos");
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [nuevoMensaje, setNuevoMensaje] = useState({
    asunto: "",
    mensaje: "",
  });

  // =====================================
  // CARGAR NOTIFICACIONES DEL ADMIN
  // =====================================

  const cargarNotificaciones = async () => {
    const { data, error } = await supabase
      .from("notificaciones")
      .select("*")
      .eq("rol_destino", "Admin")
      .order("fecha", { ascending: false });

    if (!error) setNotificaciones(data || []);
    setCargando(false);
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

    if (mensajeSeleccionado?.id_notificacion === id) {
      setMensajeSeleccionado((prev) => ({ ...prev, leido: true }));
    }
  };

  // =====================================
  // ENVIAR NOTIFICACIÓN A OTRO ROL
  // =====================================

  const handleEnviar = async () => {
    if (!nuevoMensaje.asunto || !nuevoMensaje.mensaje) return;

    setEnviando(true);

    // Siempre llega a todos los roles
    await enviarNotificacion({
      titulo: nuevoMensaje.asunto,
      descripcion: nuevoMensaje.mensaje,
      roles: ["Admin", "Gerente", "Contadora", "Mecanico"],
    });

    setMostrarModal(false);
    setEnviando(false);
    setNuevoMensaje({ asunto: "", mensaje: "" });

    // Recargar para ver si el Admin también recibió algo
    cargarNotificaciones();
  };

  // =====================================
  // FILTROS
  // =====================================

  const notificacionesFiltradas = notificaciones.filter((n) => {
    if (filtro === "sinleer") return !n.leido;
    if (filtro === "leidos") return n.leido;
    return true;
  });

  const sinLeer = notificaciones.filter((n) => !n.leido).length;
  const leidos = notificaciones.filter((n) => n.leido).length;

  const fmtFecha = (f) => {
    if (!f) return "";
    return new Date(f).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="p-4"
      style={{
        margin: 0,
        backgroundColor: FONDO,
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* ENCABEZADO (mismo estilo que Inventario) */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{
          backgroundColor: "#fffdf8",
          border: `1px solid ${DORADO_CLARO}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Notificaciones y Mensajes{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              - Gestiona tus notificaciones
            </span>
          </h4>
          {/* Línea decorativa con estrella, igual a Inventario */}
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span
              style={{
                height: "2px",
                width: "70px",
                background: `linear-gradient(to right, transparent, ${DORADO})`,
                display: "inline-block",
              }}
            />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span
              style={{
                height: "2px",
                width: "70px",
                background: `linear-gradient(to left, transparent, ${DORADO})`,
                display: "inline-block",
              }}
            />
          </div>
        </div>

        <button
          className="btn d-flex align-items-center gap-2 fw-semibold"
          onClick={() => setMostrarModal(true)}
          style={{
            background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`,
            color: "#fff",
            borderRadius: "8px",
            padding: "8px 18px 8px 8px",
            border: "none",
            boxShadow: "0 3px 12px rgba(140, 107, 63, 0.55)",
          }}
        >
          <span
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.25)" }}
          >
            <Send size={14} />
          </span>
          + Mensaje
        </button>
      </div>

      {/* CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <CardSimple title="Sin Leer" number={sinLeer} icon={<Bell size={16} />} />
        <CardSimple title="Recibidos" number={notificaciones.length} icon={<Inbox size={16} />} />
        <CardSimple title="Leídos" number={leidos} icon={<Send size={16} />} />
      </div>

      {/* CONTENIDO */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", width: "100%" }}>

        {/* IZQUIERDA — lista */}
        <div style={{ flex: "1 1 320px", minWidth: "300px" }}>
          <div
            className="p-3 rounded-4 shadow-sm mb-3"
            style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <Filter size={15} color={DORADO_OSCURO} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: DORADO_OSCURO }}>
                Filtrar
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={() => setFiltro("todos")} style={btnFiltro(filtro === "todos")}>
                Todos
              </button>
              <button onClick={() => setFiltro("sinleer")} style={btnFiltro(filtro === "sinleer")}>
                Sin leer
              </button>
              <button onClick={() => setFiltro("leidos")} style={btnFiltro(filtro === "leidos")}>
                Leídos
              </button>
            </div>
          </div>

          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {cargando ? (
              <p style={{ textAlign: "center", color: "#aaa", fontSize: 13 }}>Cargando...</p>
            ) : notificacionesFiltradas.length === 0 ? (
              <div
                className="text-center py-5 rounded-4"
                style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, color: "#999" }}
              >
                <Inbox size={32} className="mb-2 opacity-50" />
                <p style={{ margin: 0, fontSize: 13 }}>No hay notificaciones</p>
              </div>
            ) : (
              notificacionesFiltradas.map((n) => (
                <div
                  key={n.id_notificacion}
                  onClick={() => {
                    setMensajeSeleccionado(n);
                    if (!n.leido) marcarLeida(n.id_notificacion);
                  }}
                  className="shadow-sm"
                  style={{
                    background: "#fffdf8",
                    padding: "12px",
                    borderRadius: "12px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    border: `1px solid ${n.leido ? DORADO_CLARO : DORADO_OSCURO}`,
                    opacity: n.leido ? 0.7 : 1,
                    transition: "0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "13px", color: "#1a1a1a" }}>{n.titulo}</strong>
                    {!n.leido && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: DORADO,
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>

                  <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0" }}>
                    {n.descripcion?.substring(0, 60)}...
                  </p>

                  <small style={{ fontSize: "11px", color: "#aaa" }}>
                    {fmtFecha(n.fecha)}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DERECHA — detalle */}
        <div
          style={{
            flex: "2 1 500px",
            minWidth: "300px",
            background: "#fffdf8",
            borderRadius: "16px",
            padding: "20px",
            border: `1px solid ${DORADO_CLARO}`,
            minHeight: "400px",
          }}
          className="shadow-sm"
        >
          {!mensajeSeleccionado ? (
            <div style={{ textAlign: "center", color: "#6b7280", marginTop: "30px" }}>
              <Bell size={32} className="mb-2 opacity-50" color={DORADO_OSCURO} />
              <p style={{ margin: 0 }}>Selecciona una notificación</p>
            </div>
          ) : (
            <>
              <h6 style={{ color: "#1a1a1a", fontWeight: 700 }}>{mensajeSeleccionado.titulo}</h6>

              <p style={{ color: "#6b7280", fontSize: "12px" }}>
                {fmtFecha(mensajeSeleccionado.fecha)}
              </p>

              <hr style={{ borderColor: DORADO_CLARO }} />

              <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#333" }}>
                {mensajeSeleccionado.descripcion}
              </p>

              {!mensajeSeleccionado.leido && (
                <button
                  onClick={() => marcarLeida(mensajeSeleccionado.id_notificacion)}
                  className="fw-semibold"
                  style={{
                    marginTop: 10,
                    background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`,
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    boxShadow: "0 3px 12px rgba(140, 107, 63, 0.45)",
                  }}
                >
                  Marcar como leída
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL — nuevo mensaje */}
      {mostrarModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050, padding: "15px" }}
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: "100%", maxWidth: "400px", border: `1px solid ${DORADO_CLARO}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Nuevo Mensaje</h5>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setMostrarModal(false)} />
            </div>

            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
              📢 Esta notificación le llegará a <strong>todos los roles</strong> del sistema.
            </p>

            <label className="form-label small fw-semibold mb-1" style={{ color: DORADO_OSCURO }}>
              Asunto
            </label>
            <input
              placeholder="Asunto"
              value={nuevoMensaje.asunto}
              onChange={(e) =>
                setNuevoMensaje({ ...nuevoMensaje, asunto: e.target.value })
              }
              className="form-control"
              style={inputStyleSmall}
            />

            <label className="form-label small fw-semibold mb-1" style={{ color: DORADO_OSCURO }}>
              Mensaje
            </label>
            <textarea
              placeholder="Mensaje..."
              value={nuevoMensaje.mensaje}
              onChange={(e) =>
                setNuevoMensaje({ ...nuevoMensaje, mensaje: e.target.value })
              }
              className="form-control"
              style={{ ...inputStyleSmall, height: "80px", resize: "none" }}
            />

            <div className="d-flex justify-content-end gap-2 flex-wrap mt-2">
              <button
                onClick={() => setMostrarModal(false)}
                className="btn btn-secondary"
                style={{ borderRadius: "20px", padding: "8px 16px", fontSize: "13px" }}
              >
                Cancelar
              </button>

              <button
                onClick={handleEnviar}
                disabled={enviando}
                className="btn fw-semibold"
                style={{
                  background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`,
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: enviando ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  opacity: enviando ? 0.7 : 1,
                  boxShadow: "0 3px 12px rgba(140, 107, 63, 0.55)",
                }}
              >
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Estilos ── */

const inputStyleSmall = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "10px",
  border: `1px solid ${DORADO_CLARO}`,
  marginBottom: "10px",
  fontSize: "13px",
  boxSizing: "border-box",
};

const CardSimple = ({ title, number, icon }) => (
  <div
    className="shadow-sm"
    style={{
      background: "#fffdf8",
      padding: "14px",
      borderRadius: "14px",
      border: `1px solid ${DORADO_CLARO}`,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: "13px", color: "#555" }}>{title}</span>
      <span style={{ color: DORADO_OSCURO }}>{icon}</span>
    </div>
    <h5 style={{ margin: "6px 0 0", color: "#1a1a1a", fontWeight: 700 }}>{number}</h5>
  </div>
);

const btnFiltro = (activo) => ({
  padding: "5px 14px",
  borderRadius: "20px",
  border: `1px solid ${activo ? ENCABEZADO : DORADO_OSCURO}`,
  background: activo ? ENCABEZADO : "#fffdf8",
  color: activo ? TEXTO_ENCABEZADO : "#333",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: activo ? 600 : 400,
  boxShadow: activo ? "0 2px 8px rgba(19, 32, 46, 0.35)" : "none",
});

export default Notificaciones;