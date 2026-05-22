import { useState, useEffect } from "react";
import Swal from "sweetalert2";

import {
  Search,
  Clock3,
  Wrench,
  Shield,
  CheckCircle,
  Eye,
  Check,
} from "lucide-react";

function MisMantenimientos() {

  // =====================================
  // DATOS INICIALES
  // =====================================

  const datosIniciales = [
    {
      id_mantenimiento: 1,
      fecha_hora: "2026-05-12 08:30",
      tipo_de_mantenimiento: "Fisica",
      estado: "Pendiente",
      id_cliente: "Ana López",
    },

    {
      id_mantenimiento: 2,
      fecha_hora: "2026-05-11 14:15",
      tipo_de_mantenimiento: "Blindaje Nivel 3",
      estado: "En proceso",
      id_cliente: "Carlos Ruiz",
    },

    {
      id_mantenimiento: 3,
      fecha_hora: "2026-05-10 10:00",
      tipo_de_mantenimiento: "Preventivo",
      estado: "Finalizado",
      id_cliente: "María Gómez",
    },

    {
      id_mantenimiento: 4,
      fecha_hora: "2026-05-09 16:45",
      tipo_de_mantenimiento: "Online",
      estado: "Pendiente",
      id_cliente: "José Pérez",
    },
  ];

  // =====================================
  // STATE PRINCIPAL
  // =====================================

  const [data, setData] = useState([]);

  // =====================================
  // CARGAR MANTENIMIENTOS
  // =====================================

  useEffect(() => {

    const cargarTareas = () => {

      const mantenimientos =
        JSON.parse(
          localStorage.getItem(
            "mantenimientosMecanico"
          )
        ) || [];

      setData([
        ...datosIniciales,
        ...mantenimientos,
      ]);
    };

    cargarTareas();

    const intervalo = setInterval(
      cargarTareas,
      1000
    );

    return () =>
      clearInterval(intervalo);

  }, []);

  // =====================================
  // FILTROS
  // =====================================

  const TIPOS = [
    "Fisica",
    "Online",
    "Preventivo",
    "Correctivo",
    "Blindaje Nivel 1",
    "Blindaje Nivel 2",
    "Blindaje Nivel 3",
    "Blindaje Nivel 4",
    "Blindaje Nivel 5",
  ];

  const [search, setSearch] =
    useState("");

  const [filterEstado,
    setFilterEstado] =
    useState("");

  const [filterTipo,
    setFilterTipo] =
    useState("");

  // =====================================
  // FILTRADO
  // =====================================

  const filtered = data.filter((d) => {

    const q = search.toLowerCase();

    const matchQ =
      !q ||
      String(
        d.id_mantenimiento
      ).includes(q) ||
      d.id_cliente
        .toLowerCase()
        .includes(q) ||
      d.tipo_de_mantenimiento
        .toLowerCase()
        .includes(q);

    return (
      matchQ &&
      (!filterEstado ||
        d.estado ===
          filterEstado) &&
      (!filterTipo ||
        d.tipo_de_mantenimiento ===
          filterTipo)
    );
  });

  // =====================================
  // MÉTRICAS
  // =====================================

  const pendientes =
    filtered.filter(
      (d) =>
        d.estado ===
        "Pendiente"
    ).length;

  const enProceso =
    filtered.filter(
      (d) =>
        d.estado ===
        "En proceso"
    ).length;

  const finalizados =
    filtered.filter(
      (d) =>
        d.estado ===
        "Finalizado"
    ).length;

  // =====================================
  // ACEPTAR TAREA
  // =====================================

  const aceptarTarea = (id) => {

    const mantenimientos =
      JSON.parse(
        localStorage.getItem(
          "mantenimientosMecanico"
        )
      ) || [];

    const actualizados =
      mantenimientos.map((m) => {

        if (
          m.id_mantenimiento === id
        ) {

          return {
            ...m,
            estado:
              "En proceso",
          };
        }

        return m;
      });

    localStorage.setItem(
      "mantenimientosMecanico",
      JSON.stringify(
        actualizados
      )
    );

    setData((prev) =>
      prev.map((d) => {

        if (
          d.id_mantenimiento === id
        ) {

          return {
            ...d,
            estado:
              "En proceso",
          };
        }

        return d;
      })
    );

    Swal.fire({
      icon: "success",
      title: "Tarea aceptada",
      text:
        "La tarea ahora está en proceso",
      confirmButtonColor:
        "#B89B6A",
    });
  };

  // =====================================
  // FINALIZAR TAREA
  // =====================================

  const finalizarTarea = (id) => {

    const mantenimientos =
      JSON.parse(
        localStorage.getItem(
          "mantenimientosMecanico"
        )
      ) || [];

    const actualizados =
      mantenimientos.map((m) => {

        if (
          m.id_mantenimiento === id
        ) {

          return {
            ...m,
            estado:
              "Finalizado",
          };
        }

        return m;
      });

    localStorage.setItem(
      "mantenimientosMecanico",
      JSON.stringify(
        actualizados
      )
    );

    setData((prev) =>
      prev.map((d) => {

        if (
          d.id_mantenimiento === id
        ) {

          return {
            ...d,
            estado:
              "Finalizado",
          };
        }

        return d;
      })
    );

    Swal.fire({
      icon: "success",
      title:
        "Trabajo finalizado",
      confirmButtonColor:
        "#B89B6A",
    });
  };

  // =====================================
  // VER DETALLE
  // =====================================

  const verDetalle = (
    mantenimiento
  ) => {

    Swal.fire({
      title: `Mantenimiento #${mantenimiento.id_mantenimiento}`,

      html: `
        <div style="text-align:left;font-size:14px">

          <p>
            <b>Vehículo / Cliente:</b>
            ${mantenimiento.id_cliente}
          </p>

          <p>
            <b>Fecha:</b>
            ${mantenimiento.fecha_hora}
          </p>

          <p>
            <b>Tipo:</b>
            ${mantenimiento.tipo_de_mantenimiento}
          </p>

          <p>
            <b>Estado:</b>
            ${mantenimiento.estado}
          </p>

        </div>
      `,

      confirmButtonColor:
        "#B89B6A",

      confirmButtonText:
        "Cerrar",
    });
  };

  // =====================================
  // BADGE TIPO
  // =====================================

  const TipoBadge = ({
    tipo,
  }) => (
    <span
      style={{
        background: "#1f2937",
        color: "#B89B6A",
        padding: "7px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "600",
      }}
    >
      {tipo}
    </span>
  );

  // =====================================
  // BADGE ESTADO
  // =====================================

  const EstadoBadge = ({
    estado,
  }) => {

    const estilos = {
      Pendiente: {
        background:
          "#B89B6A",
        color: "#000",
      },

      "En proceso": {
        background:
          "#1f2937",
        color: "#fff",
      },

      Finalizado: {
        background:
          "#374151",
        color: "#fff",
      },
    };

    return (
      <span
        style={{
          background:
            estilos[estado]
              ?.background,

          color:
            estilos[estado]
              ?.color,

          padding: "7px 12px",

          borderRadius:
            "20px",

          fontSize: "11px",

          fontWeight: "600",
        }}
      >
        {estado}
      </span>
    );
  };

  // =====================================
  // CARD
  // =====================================

  const CardMetric = ({
    titulo,
    valor,
    subtitulo,
    icono,
  }) => (
    <div className="col-md-3">
      <div
        className="p-3 rounded-4 shadow-sm d-flex justify-content-between"
        style={{
          background: "#121212",
          border:
            "1px solid #B89B6A",
          color: "#fff",
        }}
      >
        <div>
          <small
            style={{
              color: "#B89B6A",
            }}
          >
            {titulo}
          </small>

          <h5 className="fw-bold mb-0">
            {valor}
          </h5>

          <small
            style={{
              color: "#9ca3af",
              fontSize: "11px",
            }}
          >
            {subtitulo}
          </small>
        </div>

        {icono}
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: "20px",
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >

      {/* HEADER */}

      <div className="mb-4">
        <h4 className="fw-bold mb-1">
          Mis Tareas y
          Mantenimientos
        </h4>

        <p
          className="text-muted mb-0"
          style={{
            fontSize: "13px",
          }}
        >
          Visualiza y gestiona
          tus asignaciones
        </p>
      </div>

      {/* TARJETAS */}

      <div className="row g-3 mb-4">

        <CardMetric
          titulo="Pendientes"
          valor={pendientes}
          subtitulo="Por aceptar"
          icono={
            <Clock3
              size={20}
              color="#B89B6A"
            />
          }
        />

        <CardMetric
          titulo="En proceso"
          valor={enProceso}
          subtitulo="Trabajos activos"
          icono={
            <Wrench
              size={20}
              color="#B89B6A"
            />
          }
        />

        <CardMetric
          titulo="Finalizados"
          valor={finalizados}
          subtitulo="Completados"
          icono={
            <CheckCircle
              size={20}
              color="#B89B6A"
            />
          }
        />

        <CardMetric
          titulo="Total tareas"
          valor={filtered.length}
          subtitulo="Asignaciones"
          icono={
            <Shield
              size={20}
              color="#B89B6A"
            />
          }
        />
      </div>

      {/* FILTROS */}

      <div
        className="card p-3 rounded-4 shadow-sm mb-4"
        style={{
          background: "#fff",
        }}
      >
        <h6 className="fw-bold mb-3">
          Filtros y búsqueda
        </h6>

        <div className="row g-2">

          <div className="col-md-6">
            <div className="position-relative">

              <Search
                size={16}
                style={{
                  position:
                    "absolute",
                  top: "12px",
                  left: "12px",
                  color:
                    "#6b7280",
                }}
              />

              <input
                type="text"
                className="form-control rounded-pill"
                placeholder="Buscar..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                style={{
                  paddingLeft:
                    "35px",
                }}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select rounded-pill"
              value={filterEstado}
              onChange={(e) =>
                setFilterEstado(
                  e.target.value
                )
              }
            >
              <option value="">
                Todos los estados
              </option>

              <option value="Pendiente">
                Pendiente
              </option>

              <option value="En proceso">
                En proceso
              </option>

              <option value="Finalizado">
                Finalizado
              </option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select rounded-pill"
              value={filterTipo}
              onChange={(e) =>
                setFilterTipo(
                  e.target.value
                )
              }
            >
              <option value="">
                Todos los tipos
              </option>

              {TIPOS.map((t) => (
                <option
                  key={t}
                  value={t}
                >
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLA */}

      <div
        className="card p-3 rounded-4 shadow-sm"
        style={{
          background: "#fff",
          width: "100%",
        }}
      >

        <div className="table-responsive">

          <table
            className="table align-middle mb-0"
            style={{
              minWidth: "900px",
            }}
          >

            <thead>
              <tr
                style={{
                  fontSize: "13px",
                }}
              >
                <th>ID</th>

                <th>Fecha</th>

                <th>Tipo</th>

                <th>Vehículo / Cliente</th>

                <th>Estado</th>

                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {filtered.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-5 text-muted"
                  >
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (

                  <tr
                    key={
                      d.id_mantenimiento
                    }
                    style={{
                      fontSize:
                        "13px",
                    }}
                  >
                    <td>
                      #
                      {
                        d.id_mantenimiento
                      }
                    </td>

                    <td>
                      {d.fecha_hora}
                    </td>

                    <td>
                      <TipoBadge
                        tipo={
                          d.tipo_de_mantenimiento
                        }
                      />
                    </td>

                    <td>
                      {d.id_cliente}
                    </td>

                    <td>
                      <EstadoBadge
                        estado={
                          d.estado
                        }
                      />
                    </td>

                    <td>
                      <div className="d-flex gap-2 align-items-center">

                        <Eye
                          size={18}
                          color="#B89B6A"
                          style={{
                            cursor:
                              "pointer",
                          }}
                          onClick={() =>
                            verDetalle(
                              d
                            )
                          }
                        />

                        {d.estado ===
                          "Pendiente" && (
                          <button
                            onClick={() =>
                              aceptarTarea(
                                d.id_mantenimiento
                              )
                            }
                            className="btn btn-sm"
                            style={{
                              background:
                                "#B89B6A",
                              color:
                                "#000",
                              border:
                                "none",
                              borderRadius:
                                "20px",
                              fontSize:
                                "11px",
                              fontWeight:
                                "600",
                            }}
                          >
                            <Check
                              size={14}
                            />
                          </button>
                        )}

                        {d.estado ===
                          "En proceso" && (
                          <button
                            onClick={() =>
                              finalizarTarea(
                                d.id_mantenimiento
                              )
                            }
                            className="btn btn-sm"
                            style={{
                              background:
                                "#14532d",
                              color:
                                "#fff",
                              border:
                                "none",
                              borderRadius:
                                "20px",
                              fontSize:
                                "11px",
                              fontWeight:
                                "600",
                            }}
                          >
                            <Check
                              size={14}
                            />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default MisMantenimientos;