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
      contenido:
        "Necesitamos aprobar la orden de compra para 50 unidades de blindaje frontal. El stock actual es crítico.",
      fecha: "09/04/2026",
      leido: false,
      tipo: "recibido",
    },
    {
      id: 2,
      nombre: "Coronel Ana García",
      rol: "Gerente",
      titulo: "Reporte Mensual Completado",
      contenido:
        "El reporte mensual de operaciones ha sido completado y está disponible en el módulo de reportes.",
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

  const [nuevoMensaje, setNuevoMensaje] = useState({
    destinatario: "",
    asunto: "",
    mensaje: "",
  });

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
      style={{
        padding: "20px",
        background: "#ffffff",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h5 style={{ margin: 0 }}>Notificaciones y Mensajes</h5>
          <p style={{ color: "#6b7280", marginTop: "3px", fontSize: "13px" }}>
            Gestiona tus mensajes
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
            fontSize: "13px"
          }}
        >
          + Mensaje
        </button>
      </div>

      {/* CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          margin: "15px 0",
        }}
      >
        <CardSimple title="Sin Leer" number={sinLeer} icon={<Bell size={16} />} />
        <CardSimple title="Recibidos" number={recibidos} icon={<Inbox size={16} />} />
        <CardSimple title="Enviados" number={enviados} icon={<Send size={16} />} />
      </div>

      {/* CONTENIDO */}
      <div style={{ display: "flex", gap: "15px" }}>
        
        {/* IZQUIERDA */}
        <div style={{ width: "35%" }}>
          <div
            style={{
              background: "#fff",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "10px",
              border: "1px solid #eee"
            }}
          >
            <input placeholder="Buscar..." style={inputStyleSmall} />

            <button onClick={() => setFiltro("todos")} style={btnFiltro(filtro === "todos")}>Todos</button>
            <button onClick={() => setFiltro("sinleer")} style={btnFiltro(filtro === "sinleer")}>Sin leer</button>
            <button onClick={() => setFiltro("enviados")} style={btnFiltro(filtro === "enviados")}>Enviados</button>
          </div>

          {mensajesFiltrados.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setMensajeSeleccionado(msg)}
              style={{
                background: "#fff",
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "8px",
                cursor: "pointer",
                border: "1px solid #eee"
              }}
            >
              <strong style={{ fontSize: "13px" }}>{msg.nombre}</strong>
              <p style={{ fontSize: "11px", color: "#6b7280" }}>{msg.rol}</p>
              <h6 style={{ fontSize: "13px" }}>{msg.titulo}</h6>
              <p style={{ fontSize: "12px" }}>
                {msg.contenido.substring(0, 50)}...
              </p>
              <small style={{ fontSize: "11px" }}>{msg.fecha}</small>
            </div>
          ))}
        </div>

        {/* DERECHA */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: "10px",
            padding: "15px",
            border: "1px solid #eee"
          }}
        >
          {!mensajeSeleccionado ? (
            <div style={{ textAlign: "center", color: "#6b7280", marginTop: "30px" }}>
              Selecciona un mensaje
            </div>
          ) : (
            <>
              <h6>{mensajeSeleccionado.titulo}</h6>
              <p style={{ color: "#6b7280", fontSize: "12px" }}>
                {mensajeSeleccionado.nombre} - {mensajeSeleccionado.rol}
              </p>
              <hr />
              <p style={{ fontSize: "13px" }}>{mensajeSeleccionado.contenido}</p>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div style={modalFondo}>
          <div style={{ ...modalCaja, width: "400px" }}>
            <h6>Nuevo Mensaje</h6>

            <select
              value={nuevoMensaje.destinatario}
              onChange={(e) =>
                setNuevoMensaje({ ...nuevoMensaje, destinatario: e.target.value })
              }
              style={inputStyleSmall}
            >
              <option value="">Selecciona</option>
              <option>Mecánico</option>
              <option>Gerente</option>
              <option>Contadora</option>
            </select>

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
              style={{ ...inputStyleSmall, height: "80px" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>

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

                  setNuevoMensaje({
                    destinatario: "",
                    asunto: "",
                    mensaje: "",
                  });
                }}
                style={{
                  background: "#121212",
                  color: "#B89B6A",
                  border: "1px solid #B89B6A",
                  padding: "6px 12px",
                  borderRadius: "20px"
                }}
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

/* INPUT */
const inputStyleSmall = {
  width: "100%",
  padding: "6px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  marginBottom: "8px",
  fontSize: "13px"
};

/* MODAL */
const modalFondo = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalCaja = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #B89B6A"
};

/* CARDS */
const CardSimple = ({ title, number, icon }) => (
  <div
    style={{
      background: "#fff",
      padding: "10px",
      borderRadius: "12px",
      border: "1px solid #B89B6A",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: "13px", color: "#555" }}>{title}</span>
      <span style={{ color: "#B89B6A" }}>{icon}</span>
    </div>
    <h5 style={{ margin: "5px 0", color: "#121212" }}>{number}</h5>
  </div>
);

/* BOTONES FILTRO */
const btnFiltro = (activo) => ({
  marginRight: "5px",
  padding: "4px 10px",
  borderRadius: "20px",
  border: "1px solid #B89B6A",
  background: activo ? "#121212" : "#fff",
  color: activo ? "#B89B6A" : "#333",
  cursor: "pointer",
  fontSize: "12px"
});

export default Notificaciones;