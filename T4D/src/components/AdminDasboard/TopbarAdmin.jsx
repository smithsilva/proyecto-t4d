import { useState } from "react";
import Swal from "sweetalert2";
import { Bell, User } from "lucide-react";

function TopbarAdmin({ setVista, notificaciones = [], usuario }) {

  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");

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

  return (
    <header
      className="d-flex justify-content-between align-items-center p-3 position-relative"
      style={{
        background: "#0b0b0b",
        borderBottom: "1px solid #8c6b3f",
        color: "#fff",
      }}
    >
      <h6 className="mb-0 fw-bold">Panel Administrador</h6>

      <div className="d-flex align-items-center gap-3">

        {/* 🔔 NOTIFICACIONES */}
        <div className="position-relative">
          <button
            onClick={() => setOpenNotif(!openNotif)}
            style={{
              background: "#1a1a1a",
              border: "1px solid #8c6b3f",
              padding: "12px",
              borderRadius: "50%",
              cursor: "pointer",
              position: "relative",
              color: "#fff",
            }}
          >
            <Bell size={22} />

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
                    opacity: n.leido ? 0.6 : 1,
                    border: "1px solid #333",
                  }}
                >
                  <strong style={{ color: "#b89b6a" }}>{n.titulo}</strong>
                  <p style={{ fontSize: "12px", margin: 0 }}>
                    {n.descripcion}
                  </p>
                  <small style={{ color: "#aaa" }}>{n.tiempo}</small>
                </div>
              ))}

              <button
                onClick={() => {
                  setVista("notificaciones");
                  setOpenNotif(false);
                }}
                style={{
                  width: "100%",
                  background: "#8c6b3f",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "10px",
                  marginTop: "10px",
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
    width: "45px",
    height: "45px",
    minWidth: "45px",
    borderRadius: "50%",
    overflow: "hidden",
    cursor: "pointer",
    background: "#8c6b3f",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "2px",
    border: "3px solid #B89B6A",
    boxShadow: "0 0 10px rgba(184,155,106,0.5)",
  }}
>
            {usuario?.foto ? (
              <img
                src={usuario.foto}
                alt="perfil"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              (usuario?.nombre || "US")
                .slice(0, 2)
                .toUpperCase()
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
                <div className="fw-bold">
                  {usuario?.nombre || "Usuario"}
                </div>
                <small style={{ color: "#cfcfcf" }}>
                  {usuario?.rol || "Rol"}
                </small>
              </div>

              <hr style={{ borderColor: "#333" }} />

              <button
                onClick={() => {
                  setVista("perfil");
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

export default TopbarAdmin;