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

import { supabase } from "../../supabase/supabaseClient";

function MisMantenimientos({ usuario }) {

  // =========================
  // ESTADOS
  // =========================

  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  // =========================
  // TIPOS
  // =========================

  const TIPOS = [
    "Mantenimiento",
    "Reparación",
    "Blindamiento",
    "Inspección",
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

  // =========================
  // CARGAR ASIGNACIONES
  // =========================

  const cargarAsignaciones = async () => {
console.log("USUARIO COMPLETO:", usuario);

if (!usuario) {
  console.log("Usuario no existe");
  setCargando(false);
  return;
}

console.log("ID DEL USUARIO:", usuario.id_usuario);

    setCargando(true);

    console.log("Usuario logueado:", usuario);
    console.log("ID usuario:", usuario?.id_usuario);

    const { data: rows, error } = await supabase
      .from("asignaciones_tareas")
      .select(`
        id_asignacion,
        id_mecanico,
        vehiculo,
        tipo_trabajo,
        descripcion,
        prioridad,
        fecha_limite,
        estado,
        fecha_asignacion
      `)
      .eq("id_mecanico", usuario.id_usuario)
      .order("fecha_asignacion", { ascending: false });

    console.log("Asignaciones:", rows);
    console.log("Error:", error);

    if (error) {

      console.error("Error cargando asignaciones:", error.message);

      Swal.fire({
        icon: "error",
        title: "Error cargando asignaciones",
        text: error.message,
      });

      setCargando(false);
      return;
    }

    const asignacionesFormateadas = (rows || []).map((r) => ({
      id_mantenimiento: r.id_asignacion,

      fecha_hora:
        r.fecha_asignacion
          ?.slice(0, 16)
          .replace("T", " ") || "—",

      tipo_de_mantenimiento: r.tipo_trabajo,

      id_cliente: r.vehiculo,

      descripcion: r.descripcion,

      prioridad: r.prioridad,

      fecha_limite: r.fecha_limite,

      estado: r.estado,
    }));

    setData(asignacionesFormateadas);

    setCargando(false);
  };

  // =========================
  // EFECTO
  // =========================

  useEffect(() => {

    cargarAsignaciones();

    const intervalo = setInterval(() => {
      cargarAsignaciones();
    }, 20000);

    return () => clearInterval(intervalo);

  }, [usuario]);

  // =========================
  // FILTROS
  // =========================

  const filtered = data.filter((d) => {

    const texto = search.toLowerCase();

    const coincideBusqueda =
      !texto ||
      String(d.id_mantenimiento).includes(texto) ||
      (d.id_cliente || "").toLowerCase().includes(texto) ||
      (d.tipo_de_mantenimiento || "")
        .toLowerCase()
        .includes(texto);

    return (
      coincideBusqueda &&
      (!filterEstado || d.estado === filterEstado) &&
      (!filterTipo || d.tipo_de_mantenimiento === filterTipo)
    );
  });

  // =========================
  // MÉTRICAS
  // =========================

  const pendientes = data.filter(
    (d) => d.estado === "Pendiente"
  ).length;

  const enProceso = data.filter(
    (d) => d.estado === "En proceso"
  ).length;

  const finalizados = data.filter(
    (d) => d.estado === "Finalizada"
  ).length;

  // =========================
  // ACEPTAR TAREA
  // =========================

  const aceptarTarea = async (id_asignacion) => {

    const { error } = await supabase
      .from("asignaciones_tareas")
      .update({
        estado: "En proceso",
      })
      .eq("id_asignacion", id_asignacion);

    if (error) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });

      return;
    }

    setData((prev) =>
      prev.map((d) =>
        d.id_mantenimiento === id_asignacion
          ? { ...d, estado: "En proceso" }
          : d
      )
    );

    Swal.fire({
      icon: "success",
      title: "Tarea aceptada",
      text: "La tarea ahora está en proceso",
      confirmButtonColor: "#B89B6A",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  // =========================
  // FINALIZAR TAREA
  // =========================

  const finalizarTarea = async (id_asignacion) => {

    const { error } = await supabase
      .from("asignaciones_tareas")
      .update({
        estado: "Finalizada",
      })
      .eq("id_asignacion", id_asignacion);

    if (error) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });

      return;
    }

    setData((prev) =>
      prev.map((d) =>
        d.id_mantenimiento === id_asignacion
          ? { ...d, estado: "Finalizada" }
          : d
      )
    );

    Swal.fire({
      icon: "success",
      title: "Trabajo finalizado",
      confirmButtonColor: "#B89B6A",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  // =========================
  // VER DETALLE
  // =========================

  const verDetalle = (m) => {

    Swal.fire({
      title: `Asignación #${m.id_mantenimiento}`,

      html: `
        <div style="text-align:left;font-size:14px;line-height:1.8">

          <p>
            <b>Vehículo:</b>
            ${m.id_cliente || "—"}
          </p>

          <p>
            <b>Tipo:</b>
            ${m.tipo_de_mantenimiento || "—"}
          </p>

          <p>
            <b>Descripción:</b>
            ${m.descripcion || "—"}
          </p>

          <p>
            <b>Prioridad:</b>
            ${m.prioridad || "—"}
          </p>

          <p>
            <b>Fecha asignación:</b>
            ${m.fecha_hora}
          </p>

          <p>
            <b>Fecha límite:</b>
            ${m.fecha_limite || "—"}
          </p>

          <p>
            <b>Estado:</b>
            ${m.estado}
          </p>

        </div>
      `,

      confirmButtonColor: "#B89B6A",
      confirmButtonText: "Cerrar",
    });
  };

  // =========================
  // BADGES
  // =========================

  const TipoBadge = ({ tipo }) => (
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
      {tipo || "—"}
    </span>
  );

  const EstadoBadge = ({ estado }) => {

    const estilos = {

      Pendiente: {
        background: "#B89B6A",
        color: "#000",
      },

      "En proceso": {
        background: "#1f2937",
        color: "#fff",
      },

      Finalizada: {
        background: "#14532d",
        color: "#fff",
      },
    };

    const estilo =
      estilos[estado] || {
        background: "#6b7280",
        color: "#fff",
      };

    return (
      <span
        style={{
          ...estilo,
          padding: "7px 12px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: "600",
        }}
      >
        {estado}
      </span>
    );
  };

  // =========================
  // TARJETAS
  // =========================

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
          border: "1px solid #B89B6A",
          color: "#fff",
        }}
      >

        <div>

          <small style={{ color: "#B89B6A" }}>
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

  // =========================
  // RENDER
  // =========================

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
          Mis Tareas y Mantenimientos
        </h4>

        <p
          className="text-muted mb-0"
          style={{ fontSize: "13px" }}
        >
          Visualiza y gestiona tus asignaciones
        </p>

      </div>

      {/* MÉTRICAS */}

      <div className="row g-3 mb-4">

        <CardMetric
          titulo="Pendientes"
          valor={pendientes}
          subtitulo="Por aceptar"
          icono={<Clock3 size={20} color="#B89B6A" />}
        />

        <CardMetric
          titulo="En proceso"
          valor={enProceso}
          subtitulo="Trabajos activos"
          icono={<Wrench size={20} color="#B89B6A" />}
        />

        <CardMetric
          titulo="Finalizados"
          valor={finalizados}
          subtitulo="Completados"
          icono={<CheckCircle size={20} color="#B89B6A" />}
        />

        <CardMetric
          titulo="Total tareas"
          valor={data.length}
          subtitulo="Asignaciones"
          icono={<Shield size={20} color="#B89B6A" />}
        />

      </div>

      {/* FILTROS */}

      <div
        className="card p-3 rounded-4 shadow-sm mb-4"
        style={{ background: "#fff" }}
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
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  color: "#6b7280",
                }}
              />

              <input
                type="text"
                className="form-control rounded-pill"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "35px" }}
              />

            </div>

          </div>

          <div className="col-md-3">

            <select
              className="form-select rounded-pill"
              value={filterEstado}
              onChange={(e) =>
                setFilterEstado(e.target.value)
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

              <option value="Finalizada">
                Finalizada
              </option>

            </select>

          </div>

          <div className="col-md-3">

            <select
              className="form-select rounded-pill"
              value={filterTipo}
              onChange={(e) =>
                setFilterTipo(e.target.value)
              }
            >

              <option value="">
                Todos los tipos
              </option>

              {TIPOS.map((t) => (
                <option key={t} value={t}>
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

        {cargando ? (

          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
            }}
          >

            <div
              style={{
                display: "inline-block",
                width: 28,
                height: 28,
                border: "3px solid #e5e7eb",
                borderTop: "3px solid #B89B6A",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />

            <p
              style={{
                marginTop: 12,
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              Cargando asignaciones...
            </p>

            <style>
              {`
                @keyframes spin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}
            </style>

          </div>

        ) : (

          <div className="table-responsive">

            <table
              className="table align-middle mb-0"
              style={{ minWidth: "900px" }}
            >

              <thead>

                <tr style={{ fontSize: "13px" }}>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Vehículo / Cliente</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>

              </thead>

              <tbody>

                {filtered.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5 text-muted"
                    >

                      {data.length === 0
                        ? "No tienes asignaciones aún"
                        : "Sin resultados"}

                    </td>

                  </tr>

                ) : (

                  filtered.map((d) => (

                    <tr
                      key={d.id_mantenimiento}
                      style={{ fontSize: "13px" }}
                    >

                      <td>
                        #{d.id_mantenimiento}
                      </td>

                      <td>
                        {d.fecha_hora}
                      </td>

                      <td>
                        <TipoBadge
                          tipo={d.tipo_de_mantenimiento}
                        />
                      </td>

                      <td>
                        {d.id_cliente || "—"}
                      </td>

                      <td>
                        <EstadoBadge estado={d.estado} />
                      </td>

                      <td>

                        <div className="d-flex gap-2 align-items-center">

                          <Eye
                            size={18}
                            color="#B89B6A"
                            style={{ cursor: "pointer" }}
                            onClick={() => verDetalle(d)}
                          />

                          {d.estado === "Pendiente" && (

                            <button
                              onClick={() =>
                                aceptarTarea(
                                  d.id_mantenimiento
                                )
                              }
                              className="btn btn-sm"
                              style={{
                                background: "#B89B6A",
                                color: "#000",
                                border: "none",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >

                              <Check size={14} />

                            </button>

                          )}

                          {d.estado === "En proceso" && (

                            <button
                              onClick={() =>
                                finalizarTarea(
                                  d.id_mantenimiento
                                )
                              }
                              className="btn btn-sm"
                              style={{
                                background: "#14532d",
                                color: "#fff",
                                border: "none",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >

                              <Check size={14} />

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

        )}

      </div>

    </div>
  );
}

export default MisMantenimientos;