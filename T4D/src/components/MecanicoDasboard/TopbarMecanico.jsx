import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Bell, User } from "lucide-react";

function TopbarMecanico({ setVista, usuario }) {

  const [mostrarMenu, setMostrarMenu] =
    useState(false);

  const [openNotif, setOpenNotif] =
    useState(false);

  // =====================================
  // NOTIFICACIONES
  // =====================================

  const [notificaciones,
    setNotificaciones] =
    useState([]);

  // =====================================
  // CARGAR NOTIFICACIONES
  // =====================================

  useEffect(() => {

    const cargarNotificaciones = () => {

      const guardadas =
        JSON.parse(
          localStorage.getItem(
            "notificacionesMecanico"
          )
        ) || [];

      setNotificaciones(
        guardadas
      );
    };

    cargarNotificaciones();

    const intervalo =
      setInterval(
        cargarNotificaciones,
        1000
      );

    return () =>
      clearInterval(intervalo);

  }, []);

  // =====================================
  // ACEPTAR TAREA
  // =====================================

  const aceptarTarea = (noti) => {

    // =====================================
    // GUARDAR EN TAREAS DEL MECÁNICO
    // =====================================

    const tareasGuardadas =
      JSON.parse(
        localStorage.getItem(
          "tareasMecanico"
        )
      ) || [];

    const nuevaTarea = {
      id: noti.id,

      vehiculo:
        noti.vehiculo,

      tipoTrabajo:
        noti.tipoTrabajo,

      descripcion:
        noti.descripcion,

      prioridad:
        noti.prioridad,

      fechaLimite:
        noti.fechaLimite,

      estado:
        "Pendiente",
    };

    tareasGuardadas.push(
      nuevaTarea
    );

    localStorage.setItem(
      "tareasMecanico",

      JSON.stringify(
        tareasGuardadas
      )
    );

    // =====================================
    // MARCAR NOTIFICACIÓN COMO LEÍDA
    // =====================================

    const actualizadas =
      notificaciones.map((n) =>

        n.id === noti.id
          ? {
              ...n,
              leido: true,
              titulo:
                "Tarea aceptada",
            }
          : n
      );

    setNotificaciones(
      actualizadas
    );

    localStorage.setItem(
      "notificacionesMecanico",

      JSON.stringify(
        actualizadas
      )
    );

    Swal.fire({
      icon: "success",

      title: "Tarea aceptada",

      text:
        "La tarea fue agregada a tus mantenimientos",

      confirmButtonColor:
        "#B89B6A",
    });
  };

  // =====================================
  // CERRAR SESIÓN
  // =====================================

  const cerrarSesion = () => {

    localStorage.removeItem(
      "usuario"
    );

    Swal.fire({
      icon: "success",

      title: "Sesión cerrada",

      timer: 1500,

      showConfirmButton: false,
    });

    window.location.href = "/";
  };

  const noLeidas =
    notificaciones.filter(
      (n) => !n.leido
    ).length;

  return (
    <header
      className="d-flex justify-content-between align-items-center p-3 position-relative"
      style={{
        background: "#0b0b0b",
        borderBottom:
          "1px solid #8c6b3f",
        color: "#fff",
      }}
    >
      <h6 className="mb-0 fw-bold">
        Panel Mecánico
      </h6>

      <div className="d-flex align-items-center gap-3">

        {/* NOTIFICACIONES */}

        <div className="position-relative">

          <button
            onClick={() =>
              setOpenNotif(
                !openNotif
              )
            }
            style={{
              background:
                "#1a1a1a",

              border:
                "1px solid #8c6b3f",

              padding: "8px",

              borderRadius:
                "50%",

              cursor: "pointer",

              position:
                "relative",

              color: "#fff",
            }}
          >
            <Bell size={20} />

            {noLeidas > 0 && (
              <span
                style={{
                  position:
                    "absolute",

                  top: "-5px",

                  right: "-5px",

                  background:
                    "#8c6b3f",

                  color: "#fff",

                  borderRadius:
                    "50%",

                  fontSize:
                    "10px",

                  padding:
                    "2px 6px",
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

                background:
                  "#1a1a1a",

                border:
                  "1px solid #8c6b3f",

                color: "#fff",

                maxHeight:
                  "450px",

                overflowY:
                  "auto",
              }}
            >
              <strong>
                Notificaciones
              </strong>

              {notificaciones.length ===
              0 ? (

                <div
                  style={{
                    marginTop:
                      "15px",

                    textAlign:
                      "center",

                    color:
                      "#aaa",

                    fontSize:
                      "13px",
                  }}
                >
                  No hay notificaciones
                </div>

              ) : (

                notificaciones.map(
                  (n) => (

                    <div
                      key={n.id}
                      style={{
                        background:
                          "#0b0b0b",

                        padding:
                          "10px",

                        borderRadius:
                          "10px",

                        marginTop:
                          "10px",

                        border:
                          "1px solid #333",

                        opacity:
                          n.leido
                            ? 0.6
                            : 1,
                      }}
                    >
                      <strong
                        style={{
                          color:
                            "#b89b6a",
                        }}
                      >
                        {n.titulo}
                      </strong>

                      <p
                        style={{
                          fontSize:
                            "12px",

                          margin:
                            "6px 0",
                        }}
                      >
                        {
                          n.descripcion
                        }
                      </p>

                      <small
                        style={{
                          color:
                            "#aaa",
                        }}
                      >
                        {n.tiempo}
                      </small>

                      {!n.leido && (

                        <button
                          onClick={() =>
                            aceptarTarea(
                              n
                            )
                          }
                          style={{
                            marginTop:
                              "10px",

                            width:
                              "100%",

                            background:
                              "#B89B6A",

                            border:
                              "none",

                            padding:
                              "7px",

                            borderRadius:
                              "10px",

                            fontSize:
                              "12px",

                            fontWeight:
                              "bold",

                            cursor:
                              "pointer",

                            color:
                              "#000",
                          }}
                        >
                          Aceptar tarea
                        </button>

                      )}
                    </div>
                  )
                )

              )}
            </div>
          )}
        </div>

        {/* PERFIL */}

        <div className="position-relative">

          <div
            onClick={() =>
              setMostrarMenu(
                !mostrarMenu
              )
            }
            style={{
              width: "35px",

              height: "35px",

              borderRadius:
                "50%",

              backgroundColor:
                "#8c6b3f",

              cursor: "pointer",

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              color: "#fff",

              fontWeight:
                "bold",

              overflow:
                "hidden",
            }}
          >
            {usuario?.foto ? (

              <img
                src={usuario.foto}
                alt="perfil"
                style={{
                  width: "100%",

                  height:
                    "100%",

                  objectFit:
                    "cover",
                }}
              />

            ) : (

              usuario?.nombre
                ?.slice(0, 2)
                .toUpperCase()

            )}
          </div>

          {mostrarMenu && (

            <div
              className="position-absolute end-0 mt-2 p-3 rounded-4"
              style={{
                width: "220px",

                zIndex: 1000,

                background:
                  "#1a1a1a",

                border:
                  "1px solid #8c6b3f",

                color: "#fff",
              }}
            >
              <div className="text-center mb-2">

                <div className="fw-bold">
                  {usuario?.nombre}
                </div>

                <small
                  style={{
                    color:
                      "#cfcfcf",
                  }}
                >
                  {usuario?.rol}
                </small>
              </div>

              <hr
                style={{
                  borderColor:
                    "#333",
                }}
              />

              <button
                onClick={() => {

                  setVista(
                    "perfil"
                  );

                  setMostrarMenu(
                    false
                  );
                }}
                className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                style={{
                  background:
                    "#0b0b0b",

                  color: "#fff",

                  border:
                    "1px solid #333",

                  padding:
                    "6px",

                  borderRadius:
                    "10px",
                }}
              >
                <User size={16} />
                Mi Perfil
              </button>

              <button
                onClick={
                  cerrarSesion
                }
                className="w-100 rounded-pill"
                style={{
                  background:
                    "#8c3f3f",

                  color: "#fff",

                  border: "none",

                  padding:
                    "6px",
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

export default TopbarMecanico;