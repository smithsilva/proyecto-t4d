import { useState, useEffect } from "react";
import { Bell, Inbox, Send } from "lucide-react";
import { supabase } from "../../Supabase/supabaseClient"; // ajusta la ruta
import { enviarNotificacion } from "../../utils/notificaciones.helper";

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
      style={{
        padding: "20px",
        background: "#ffffff",
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h5 style={{ margin: 0 }}>Notificaciones y Mensajes</h5>
          <p style={{ color: "#6b7280", marginTop: "3px", fontSize: "13px" }}>
            Gestiona tus notificaciones
          </p>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          style={{
            background: "#121212",
            color: "#B89B6A",
            border: "1px solid #B89B6A",
            padding: "6px 12px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          + Mensaje
        </button>
      </div>

      {/* CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
          margin: "15px 0",
        }}
      >
        <CardSimple title="Sin Leer" number={sinLeer} icon={<Bell size={16} />} />
        <CardSimple title="Recibidos" number={notificaciones.length} icon={<Inbox size={16} />} />
        <CardSimple title="Leídos" number={leidos} icon={<Send size={16} />} />
      </div>

      {/* CONTENIDO */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", width: "100%" }}>

        {/* IZQUIERDA — lista */}
        <div style={{ flex: "1 1 320px", minWidth: "300px" }}>
          <div
            style={{
              background: "#fff",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "10px",
              border: "1px solid #eee",
            }}
          >
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
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
              <p style={{ textAlign: "center", color: "#aaa", fontSize: 13, marginTop: 20 }}>
                No hay notificaciones
              </p>
            ) : (
              notificacionesFiltradas.map((n) => (
                <div
                  key={n.id_notificacion}
                  onClick={() => {
                    setMensajeSeleccionado(n);
                    if (!n.leido) marcarLeida(n.id_notificacion);
                  }}
                  style={{
                    background: "#fff",
                    padding: "10px",
                    borderRadius: "10px",
                    marginBottom: "8px",
                    cursor: "pointer",
                    border: `1px solid ${n.leido ? "#eee" : "#B89B6A"}`,
                    opacity: n.leido ? 0.7 : 1,
                    transition: "0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "13px" }}>{n.titulo}</strong>
                    {!n.leido && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#B89B6A",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>

                  <p style={{ fontSize: "12px", color: "#555", margin: "4px 0" }}>
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
            background: "#fff",
            borderRadius: "10px",
            padding: "15px",
            border: "1px solid #eee",
            minHeight: "400px",
          }}
        >
          {!mensajeSeleccionado ? (
            <div style={{ textAlign: "center", color: "#6b7280", marginTop: "30px" }}>
              Selecciona una notificación
            </div>
          ) : (
            <>
              <h6>{mensajeSeleccionado.titulo}</h6>

              <p style={{ color: "#6b7280", fontSize: "12px" }}>
                {fmtFecha(mensajeSeleccionado.fecha)}
              </p>

              <hr />

              <p style={{ fontSize: "13px", lineHeight: "1.6" }}>
                {mensajeSeleccionado.descripcion}
              </p>

              {!mensajeSeleccionado.leido && (
                <button
                  onClick={() => marcarLeida(mensajeSeleccionado.id_notificacion)}
                  style={{
                    marginTop: 10,
                    background: "#121212",
                    color: "#B89B6A",
                    border: "1px solid #B89B6A",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
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
        <div style={modalFondo}>
          <div style={{ ...modalCaja, width: "100%", maxWidth: "400px" }}>
            <h6>Nuevo Mensaje</h6>

            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
              📢 Esta notificación le llegará a <strong>todos los roles</strong> del sistema.
            </p>

            <input
              placeholder="Asunto"
              value={nuevoMensaje.asunto}
              onChange={(e) =>
                setNuevoMensaje({ ...nuevoMensaje, asunto: e.target.value })
              }
              style={inputStyleSmall}
            />

            <textarea
              placeholder="Mensaje..."
              value={nuevoMensaje.mensaje}
              onChange={(e) =>
                setNuevoMensaje({ ...nuevoMensaje, mensaje: e.target.value })
              }
              style={{ ...inputStyleSmall, height: "80px", resize: "none" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setMostrarModal(false)}
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleEnviar}
                disabled={enviando}
                style={{
                  background: "#121212",
                  color: "#B89B6A",
                  border: "1px solid #B89B6A",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  cursor: enviando ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  opacity: enviando ? 0.7 : 1,
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
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  marginBottom: "8px",
  fontSize: "13px",
  boxSizing: "border-box",
};

const modalFondo = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "15px",
  zIndex: 1000,
};

const modalCaja = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #B89B6A",
  boxSizing: "border-box",
};

const CardSimple = ({ title, number, icon }) => (
  <div
    style={{
      background: "#fff",
      padding: "10px",
      borderRadius: "12px",
      border: "1px solid #B89B6A",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: "13px", color: "#555" }}>{title}</span>
      <span style={{ color: "#B89B6A" }}>{icon}</span>
    </div>
    <h5 style={{ margin: "5px 0", color: "#121212" }}>{number}</h5>
  </div>
);

const btnFiltro = (activo) => ({
  padding: "4px 10px",
  borderRadius: "20px",
  border: "1px solid #B89B6A",
  background: activo ? "#121212" : "#fff",
  color: activo ? "#B89B6A" : "#333",
  cursor: "pointer",
  fontSize: "12px",
});

export default Notificaciones;