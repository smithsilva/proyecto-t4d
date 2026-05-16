import { useState } from "react";
import { Bell, Inbox, Send } from "lucide-react";

function Notificaciones({ notificaciones, setNotificaciones }) {
  const [filtro, setFiltro] = useState("todos");
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);

  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      nombre: "Sargento Miguel Torres",
      rol: "Mecánico",
      titulo: "Solicitud de Piezas de Repuesto",
      contenido: "Necesitamos aprobar la orden de compra para 50 unidades de blindaje frontal. El stock actual es crítico.",
      fecha: "09/04/2026",
      leido: false,
      tipo: "recibido",
    },
    {
      id: 2,
      nombre: "Coronel Ana García",
      rol: "Gerente",
      titulo: "Reporte Mensual Completado",
      contenido: "El reporte mensual de operaciones ha sido completado y está disponible en el módulo de reportes.",
      fecha: "08/04/2026",
      leido: true,
      tipo: "recibido",
    },
    {
      id: 3,
      nombre: "Tú",
      rol: "Administrador",
      titulo: "Solicitud enviada",
      contenido: "Se envió solicitud de mantenimiento al área técnica.",
      fecha: "07/04/2026",
      leido: true,
      tipo: "enviado",
    },
  ]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState({ destinatario: "", asunto: "", mensaje: "" });

  const sinLeer = mensajes.filter((m) => !m.leido).length;
  const recibidos = mensajes.filter((m) => m.tipo === "recibido").length;
  const enviados = mensajes.filter((m) => m.tipo === "enviado").length;

  const mensajesFiltrados = mensajes.filter((m) => {
    if (filtro === "sinleer") return !m.leido;
    if (filtro === "enviados") return m.tipo === "enviado";
    return true;
  });

  return (
    <div
      className="p-5"
      style={{ background: "#fff", minHeight: "100vh" }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Notificaciones y Mensajes</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Gestiona tus mensajes</p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}
        >
          + Mensaje
        </button>
      </div>

      {/* CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Sin Leer</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={18} color="#B89B6A" />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#B89B6A" }}>{sinLeer}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Recibidos</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Inbox size={18} color="#B89B6A" />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#374151" }}>{recibidos}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Enviados</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={18} color="#B89B6A" />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#1f2937" }}>{enviados}</div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ display: "flex", gap: "15px" }}>
        {/* IZQUIERDA */}
        <div style={{ width: "35%" }}>
          <div className="card p-3 rounded-4 shadow-sm mb-3" style={{ border: "1px solid #e5e7eb" }}>
            <input
              placeholder="Buscar..."
              style={{ width: "100%", padding: "8px 12px", borderRadius: "20px", border: "1px solid #e5e7eb", marginBottom: "10px", fontSize: "13px", outline: "none" }}
            />
            <div className="d-flex gap-2">
              {["todos","sinleer","enviados"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    border: "1px solid #B89B6A",
                    background: filtro === f ? "#B89B6A" : "#fff",
                    color: filtro === f ? "#000" : "#333",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {f === "todos" ? "Todos" : f === "sinleer" ? "Sin leer" : "Enviados"}
                </button>
              ))}
            </div>
          </div>

          {mensajesFiltrados.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setMensajeSeleccionado(msg)}
              className="card p-3 rounded-4 shadow-sm mb-2"
              style={{ border: "1px solid #e5e7eb", cursor: "pointer" }}
            >
              <strong style={{ fontSize: "13px" }}>{msg.nombre}</strong>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0" }}>{msg.rol}</p>
              <h6 style={{ fontSize: "13px", margin: "4px 0" }}>{msg.titulo}</h6>
              <p style={{ fontSize: "12px", margin: 0 }}>{msg.contenido.substring(0, 50)}...</p>
              <small style={{ fontSize: "11px", color: "#9ca3af" }}>{msg.fecha}</small>
            </div>
          ))}
        </div>

        {/* DERECHA */}
        <div className="card p-3 rounded-4 shadow-sm" style={{ flex: 1, border: "1px solid #e5e7eb" }}>
          {!mensajeSeleccionado ? (
            <div style={{ textAlign: "center", color: "#6b7280", marginTop: "30px" }}>Selecciona un mensaje</div>
          ) : (
            <>
              <h6>{mensajeSeleccionado.titulo}</h6>
              <p style={{ color: "#6b7280", fontSize: "12px" }}>{mensajeSeleccionado.nombre} - {mensajeSeleccionado.rol}</p>
              <hr />
              <p style={{ fontSize: "13px" }}>{mensajeSeleccionado.contenido}</p>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }}
        >
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: "400px", border: "1px solid #B89B6A" }}>
            <h6 className="fw-bold mb-3">Nuevo Mensaje</h6>
            <select
              value={nuevoMensaje.destinatario}
              onChange={(e) => setNuevoMensaje({ ...nuevoMensaje, destinatario: e.target.value })}
              className="form-select mb-2"
            >
              <option value="">Selecciona</option>
              <option>Mecánico</option>
              <option>Gerente</option>
              <option>Contadora</option>
            </select>
            <input
              placeholder="Asunto"
              value={nuevoMensaje.asunto}
              onChange={(e) => setNuevoMensaje({ ...nuevoMensaje, asunto: e.target.value })}
              className="form-control mb-2"
            />
            <textarea
              placeholder="Mensaje..."
              value={nuevoMensaje.mensaje}
              onChange={(e) => setNuevoMensaje({ ...nuevoMensaje, mensaje: e.target.value })}
              className="form-control mb-3"
              style={{ height: "80px" }}
            />
            <div className="d-flex justify-content-end gap-2">
              <button onClick={() => setMostrarModal(false)} className="btn btn-secondary btn-sm">Cancelar</button>
              <button
                onClick={() => {
                  const nuevo = {
                    id: Date.now(),
                    nombre: "Tú",
                    rol: "Administrador",
                    titulo: nuevoMensaje.asunto,
                    contenido: nuevoMensaje.mensaje,
                    fecha: new Date().toLocaleDateString(),
                    leido: true,
                    tipo: "enviado",
                  };
                  setMensajes([nuevo, ...mensajes]);
                  setMostrarModal(false);
                  setNuevoMensaje({ destinatario: "", asunto: "", mensaje: "" });
                }}
                className="btn btn-sm"
                style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notificaciones;