import { useState } from "react";

const TruckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h4.385a1 1 0 0 1 .864 .496l1.751 2.989" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const PlayIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <circle cx="12" cy="12" r="9" />
    <polygon points="10,8 16,12 10,16" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TriangleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#aaa"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const initialAsignaciones = [
  {
    id: 1,
    vehiculo: "VT-001 - Humvee Blindado",
    tipoTrabajo: "Mantenimiento",
    descripcion: "Revisión general del sistema de blindaje",
    mecanico: "Todos los mecánicos",
    prioridad: "Alta",
    fechaLimite: "10/5/2026",
    estado: "Pendiente",
  },
];

const estadoConfig = {
  Pendiente: {
    bg: "#fff",
    color: "#000",
    border: "1.5px solid #B89B6A",
  },

  "En proceso": {
    bg: "#fff",
    color: "#000",
    border: "1.5px solid #B89B6A",
  },

  Finalizada: {
    bg: "#fff",
    color: "#000",
    border: "1.5px solid #B89B6A",
  },
};

const prioridadStyle = {
  Alta: {
    background: "#B89B6A",
    color: "#000",
  },

  Media: {
    background: "#374151",
    color: "#fff",
  },
};

export default function AsignacionTareas() {
  const [busqueda, setBusqueda] =
    useState("");

  const [asignaciones, setAsignaciones] =
    useState(initialAsignaciones);

  const [modalNueva, setModalNueva] =
    useState(false);

  const [nuevaAsignacion, setNuevaAsignacion] =
    useState({
      vehiculo: "",
      tipoTrabajo: "Mantenimiento",
      descripcion: "",
      prioridad: "Alta",
      fechaLimite: "",
    });

  const filtradas =
    asignaciones.filter((a) =>
      a.vehiculo
        .toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )
    );

  // ======================================
  // CREAR ASIGNACION
  // ======================================

  const crearAsignacion = () => {
    const nueva = {
      id: Date.now(),

      ...nuevaAsignacion,

      mecanico:
        "Todos los mecánicos",

      estado: "Pendiente",
    };

    setAsignaciones((prev) => [
      nueva,
      ...prev,
    ]);

    // ======================================
    // NOTIFICACION POR ROL
    // ======================================

    const notificaciones =
      JSON.parse(
        localStorage.getItem(
          "notificaciones"
        )
      ) || [];

    const nuevaNotificacion = {
      id: Date.now(),

      rol: "Mecanico",

      titulo: "Nueva asignación",

      descripcion:
        `Nuevo trabajo de ${nueva.tipoTrabajo}`,

      vehiculo: nueva.vehiculo,

      fecha:
        new Date().toLocaleString(),

      leido: false,
    };

    localStorage.setItem(
      "notificaciones",
      JSON.stringify([
        nuevaNotificacion,
        ...notificaciones,
      ])
    );

    setModalNueva(false);

    setNuevaAsignacion({
      vehiculo: "",
      tipoTrabajo: "Mantenimiento",
      descripcion: "",
      prioridad: "Alta",
      fechaLimite: "",
    });
  };

  return (
    <div
      style={{
        fontFamily:
          "'Segoe UI', system-ui, sans-serif",

        background: "#fff",

        minHeight: "100vh",

        padding: "28px 32px",

        color: "#1a1a2e",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",

          alignItems: "flex-start",

          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111",
              margin: 0,
            }}
          >
            Asignación de Tareas
          </h1>

          <div
            style={{
              width: 60,
              height: 3,
              backgroundColor:
                "#B89B6A",
              borderRadius: 10,
              margin: "6px 0 4px",
            }}
          />

          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              margin: 0,
            }}
          >
            Gestiona las asignaciones
            de trabajo para los
            mecánicos
          </p>
        </div>

        <button
          onClick={() =>
            setModalNueva(true)
          }
          style={{
            background: "#B89B6A",
            color: "#000",
            border: "none",
            padding: "10px 18px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <PlusIcon />
          Nueva Asignación
        </button>
      </div>

      {/* TARJETAS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Pendientes",
            value:
              asignaciones.filter(
                (a) =>
                  a.estado ===
                  "Pendiente"
              ).length,
            icon: <ClockIcon />,
          },

          {
            label: "En proceso",
            value:
              asignaciones.filter(
                (a) =>
                  a.estado ===
                  "En proceso"
              ).length,
            icon: <PlayIcon />,
          },

          {
            label: "Finalizadas",
            value:
              asignaciones.filter(
                (a) =>
                  a.estado ===
                  "Finalizada"
              ).length,
            icon: <CheckIcon />,
          },

          {
            label: "Alta prioridad",
            value:
              asignaciones.filter(
                (a) =>
                  a.prioridad ===
                  "Alta"
              ).length,
            icon: <TriangleIcon />,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              border:
                "1.5px solid #B89B6A",
              borderRadius: 16,
              padding: "20px 22px",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </span>

              <span
                style={{
                  color: "#B89B6A",
                }}
              >
                {s.icon}
              </span>
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* BUSQUEDA */}

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "20px 22px",
          marginBottom: 24,
          border:
            "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border:
              "1px solid #e5e7eb",
            borderRadius: 20,
            padding: "8px 14px",
          }}
        >
          <SearchIcon />

          <input
            type="text"
            placeholder="Buscar vehículo..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
            style={{
              border: "none",
              outline: "none",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* TABLA */}

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "20px 22px",
          border:
            "1px solid #e5e7eb",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr>
              {[
                "Vehículo",
                "Tipo",
                "Descripción",
                "Mecánico",
                "Prioridad",
                "Fecha",
                "Estado",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtradas.map((a) => (
              <tr key={a.id}>
                <td
                  style={{
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 8,
                    }}
                  >
                    <TruckIcon />
                    {a.vehiculo}
                  </div>
                </td>

                <td
                  style={{
                    padding: "12px",
                  }}
                >
                  {a.tipoTrabajo}
                </td>

                <td
                  style={{
                    padding: "12px",
                  }}
                >
                  {a.descripcion}
                </td>

                <td
                  style={{
                    padding: "12px",
                  }}
                >
                  {a.mecanico}
                </td>

                <td
                  style={{
                    padding: "12px",
                  }}
                >
                  <span
                    style={{
                      ...prioridadStyle[
                        a.prioridad
                      ],

                      padding:
                        "4px 10px",

                      borderRadius: 20,

                      fontSize: 11,
                    }}
                  >
                    {a.prioridad}
                  </span>
                </td>

                <td
                  style={{
                    padding: "12px",
                  }}
                >
                  {a.fechaLimite}
                </td>

                <td
                  style={{
                    padding: "12px",
                  }}
                >
                  <span
                    style={{
                      background:
                        estadoConfig[
                          a.estado
                        ].bg,

                      color:
                        estadoConfig[
                          a.estado
                        ].color,

                      border:
                        estadoConfig[
                          a.estado
                        ].border,

                      padding:
                        "4px 10px",

                      borderRadius: 20,

                      fontSize: 11,
                    }}
                  >
                    {a.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}

      {modalNueva && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "rgba(0,0,0,0.5)",

            display: "flex",

            justifyContent:
              "center",

            alignItems: "center",

            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              width: 420,
            }}
          >
            <h5
              style={{
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              Nueva Asignación
            </h5>

            <input
              type="text"
              placeholder="Vehículo"
              value={
                nuevaAsignacion.vehiculo
              }
              onChange={(e) =>
                setNuevaAsignacion({
                  ...nuevaAsignacion,
                  vehiculo:
                    e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: 12,
                borderRadius: 8,
                border:
                  "1px solid #ddd",
              }}
            />

            <select
              value={
                nuevaAsignacion.tipoTrabajo
              }
              onChange={(e) =>
                setNuevaAsignacion({
                  ...nuevaAsignacion,
                  tipoTrabajo:
                    e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: 12,
                borderRadius: 8,
                border:
                  "1px solid #ddd",
              }}
            >
              <option>
                Mantenimiento
              </option>

              <option>
                Reparación
              </option>

              <option>
                Blindamiento
              </option>
            </select>

            <textarea
              placeholder="Descripción"
              value={
                nuevaAsignacion.descripcion
              }
              onChange={(e) =>
                setNuevaAsignacion({
                  ...nuevaAsignacion,
                  descripcion:
                    e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: 12,
                borderRadius: 8,
                border:
                  "1px solid #ddd",
              }}
            />

            <input
              type="date"
              value={
                nuevaAsignacion.fechaLimite
              }
              onChange={(e) =>
                setNuevaAsignacion({
                  ...nuevaAsignacion,
                  fechaLimite:
                    e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: 20,
                borderRadius: 8,
                border:
                  "1px solid #ddd",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() =>
                  setModalNueva(false)
                }
                style={{
                  padding:
                    "8px 18px",

                  borderRadius: 8,

                  border:
                    "1px solid #ddd",

                  background: "#fff",
                }}
              >
                Cancelar
              </button>

              <button
                onClick={
                  crearAsignacion
                }
                style={{
                  padding:
                    "8px 18px",

                  borderRadius: 8,

                  border: "none",

                  background:
                    "#B89B6A",

                  color: "#000",

                  fontWeight: 600,
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}