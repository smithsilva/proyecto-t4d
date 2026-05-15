import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Bell, User } from "lucide-react";

function TopbarContadora({ setVista, setVistaContadora }) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const [notificaciones, setNotificaciones] = useState([
    {
      id: 1,
      titulo: "Nuevo reporte disponible",
      descripcion: "El gerente subió un nuevo reporte",
      tiempo: "Hace 2 min",
      leido: false,
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nueva = {
        id: Date.now(),
        titulo: "Nueva solicitud",
        descripcion: "Se registró un nuevo movimiento contable",
        tiempo: "Ahora",
        leido: false,
      };

      setNotificaciones((prev) => [nueva, ...prev]);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");

    Swal.fire({
      icon: "success",
      title: "Sesión cerrada",
      timer: 1500,
      showConfirmButton: false,
    });

    setVista("home");
  };

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  return (
    <header
      className="d-flex justify-content-between align-items-center p-3 position-relative"
      style={{
        background: "#0b0b0b",
        borderBottom: "1px solid #8c6b3f",
        color: "#fff",
      }}
    >
      {/* TÍTULO */}
      <h6 className="mb-0 fw-bold">Panel Contadora</h6>

      {/* DERECHA */}
      <div className="d-flex align-items-center gap-3">

        {/* 🔔 NOTIFICACIONES */}
        <div className="position-relative">

          <button
            onClick={() => setOpenNotif(!openNotif)}
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
                width: "300px",
                zIndex: 1000,
                background: "#1a1a1a",
                border: "1px solid #8c6b3f",
                color: "#fff",
              }}
            >
              <strong>Notificaciones</strong>

              {notificaciones.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: "#0b0b0b",
                    padding: "10px",
                    borderRadius: "10px",
                    marginTop: "10px",
                    border: "1px solid #333",
                    opacity: n.leido ? 0.6 : 1,
                  }}
                >
                  <strong style={{ color: "#b89b6a" }}>
                    {n.titulo}
                  </strong>
                  <p style={{ fontSize: "12px", margin: 0 }}>
                    {n.descripcion}
                  </p>
                  <small style={{ color: "#aaa" }}>{n.tiempo}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 👤 PERFIL */}
        <div className="position-relative">

          <div
            onClick={() => setMostrarMenu(!mostrarMenu)}
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "#8c6b3f",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            <User size={18} />
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
                <div className="fw-bold">Nicol Zuñiga</div>
                <small style={{ color: "#cfcfcf" }}>Contadora</small>
              </div>

              <hr style={{ borderColor: "#333" }} />

               <button
                onClick={() => {
                  setVistaContadora("perfil");
                  setMostrarMenu(false);
                }}
                className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "#0b0b0b",
                  color: "#fff",
                  border: "1px solid #333",
                  padding: "6px",
                  borderRadius: "10px",
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

export default TopbarContadora;