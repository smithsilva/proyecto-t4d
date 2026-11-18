import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Users,
  DollarSign,
  BadgeCheck,
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
  Filter,
} from "lucide-react";
import {
  obtenerEmpleados,
  crearEmpleado,
  editarEmpleado,
  actualizarParcialEmpleado,
  eliminarEmpleado,
  mensajeError,
} from "../../api/empleadosApi";
import { obtenerRoles } from "../../api/rolesApi";

// =========================================
// COMPONENTE COMPARTIDO
//   esAdmin = true  → CRUD completo (Admin)
//   esAdmin = false → solo ver + editar tipo de contrato y fecha de terminación (Contadora)
// El backend valida los permisos igualmente; esto solo adapta la pantalla.
// =========================================

// Si en tu BD hay más tipos de contrato, agrégalos aquí
const TIPOS_CONTRATO = ["Indefinido", "Temporal"];

// =========================================
// PALETA
// =========================================
const DORADO          = "#d4a743";
const DORADO_OSCURO   = "#8c6b3f";
const DORADO_CLARO    = "#e7c98a";
const FONDO           = "#f7f1e3";
const ENCABEZADO      = "#13202e";
const TEXTO_ENC       = "#e7c98a";
const BTN_GRAD        = "linear-gradient(135deg, #c9941f, #8c6b3f)";

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  marginBottom: 12,
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  background: "#fafafa",
  color: "#111827",
};

const inputBloqueado = {
  ...inputStyle,
  background: "#f0ece4",
  color: "#6b7280",
  cursor: "not-allowed",
};

const labelStyle = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 };

// =========================================
// UTILIDADES
// =========================================

const fmt = (n) =>
  "$ " + Number(n || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 });

function formatFecha(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("T")[0].split("-");
  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre",
  ];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

// Fecha de hoy en AAAA-MM-DD (hora local)
const hoy = () => new Date().toLocaleDateString("en-CA");

// Activo = sin fecha de terminación, o con una fecha futura
const estaActivo = (e) => !e.fecha_terminacion || e.fecha_terminacion > hoy();

const EMPLEADO_VACIO = {
  cedula: "",
  nombre_completo: "",
  cargo: "",
  salario: "",
  fecha_contratacion: "",
  fecha_terminacion: "",
  tipo_contrato: "Indefinido",
  id_rol: "",
};

// =========================================
// COMPONENTE PRINCIPAL
// =========================================

export default function Empleados({ esAdmin = false, soloLectura = false }) {
  const [empleados,     setEmpleados]     = useState([]);
  const [roles,         setRoles]         = useState([]);
  const [busqueda,      setBusqueda]      = useState("");
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState(null);
  const [verEmpleado,   setVerEmpleado]   = useState(null);
  const [mostrarModal,  setMostrarModal]  = useState(false);
  const [modoEdicion,   setModoEdicion]   = useState(false);
  const [empleadoId,    setEmpleadoId]    = useState(null);
  const [form,          setForm]          = useState(EMPLEADO_VACIO);
  const [guardando,     setGuardando]     = useState(false);

  // ── CARGAR ───────────────────────────────
  const cargarEmpleados = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerEmpleados();
      setEmpleados(data || []);
    } catch (err) {
      setError("Error al cargar empleados: " + mensajeError(err));
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarEmpleados();

    // Solo el Admin necesita la lista de roles (para el selector del formulario)
    if (esAdmin) {
      obtenerRoles()
        .then((data) => setRoles(data || []))
        .catch((err) => setError("Error al cargar roles: " + mensajeError(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── FILTRO ───────────────────────────────
  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return empleados;
    return empleados.filter(
      (e) =>
        e.nombre_completo?.toLowerCase().includes(q) ||
        e.cargo?.toLowerCase().includes(q) ||
        String(e.cedula || "").includes(q) ||
        e.roles?.nombre_rol?.toLowerCase().includes(q)
    );
  }, [empleados, busqueda]);

  // ── MÉTRICAS (solo personal activo) ──────
  const activos         = empleados.filter(estaActivo);
  const nominaMensual   = activos.reduce((acc, e) => acc + Number(e.salario || 0), 0);
  const salarioPromedio = activos.length > 0 ? Math.round(nominaMensual / activos.length) : 0;

  const statCards = [
    { label: "Total Empleados",  valor: activos.length,       sublabel: "personal activo", color: DORADO,        border: DORADO,       Icon: Users },
    { label: "Nómina Mensual",   valor: fmt(nominaMensual),   sublabel: "costo total",     color: "#1a1a1a",     border: "#9ca3af",    Icon: DollarSign },
    { label: "Salario Promedio", valor: fmt(salarioPromedio), sublabel: "por empleado",    color: DORADO_OSCURO, border: DORADO_CLARO, Icon: BadgeCheck },
  ];

  // ── MODAL ────────────────────────────────
  const abrirAgregar = () => {
    setModoEdicion(false);
    setEmpleadoId(null);
    setForm(EMPLEADO_VACIO);
    setError(null);
    setMostrarModal(true);
  };

  const abrirEditar = (e) => {
    setModoEdicion(true);
    setEmpleadoId(e.id_empleado);
    setForm({
      cedula:             e.cedula ?? "",
      nombre_completo:    e.nombre_completo ?? "",
      cargo:              e.cargo ?? "",
      salario:            e.salario ?? "",
      fecha_contratacion: e.fecha_contratacion ? String(e.fecha_contratacion).split("T")[0] : "",
      fecha_terminacion:  e.fecha_terminacion ? String(e.fecha_terminacion).split("T")[0] : "",
      tipo_contrato:      e.tipo_contrato ?? "Indefinido",
      id_rol:             e.id_rol ?? "",
    });
    setError(null);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setEmpleadoId(null);
    setForm(EMPLEADO_VACIO);
  };

  // ── GUARDAR ──────────────────────────────
  const guardarEmpleado = async (ev) => {
    ev.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      if (!esAdmin) {
        // Contadora: solo estos dos campos
        await actualizarParcialEmpleado(empleadoId, {
          tipo_contrato:     form.tipo_contrato,
          fecha_terminacion: form.fecha_terminacion || null,
        });
      } else {
        const payload = {
          cedula:             String(form.cedula).trim(),
          nombre_completo:    form.nombre_completo.trim(),
          cargo:              form.cargo.trim(),
          salario:            Number(form.salario),
          fecha_contratacion: form.fecha_contratacion,
          fecha_terminacion:  form.fecha_terminacion || null,
          tipo_contrato:      form.tipo_contrato,
          id_rol:             form.id_rol ? Number(form.id_rol) : null,
        };

        if (modoEdicion) await editarEmpleado(empleadoId, payload);
        else await crearEmpleado(payload);
      }

      await cargarEmpleados();
      cerrarModal();
    } catch (err) {
      setError((modoEdicion ? "Error al editar: " : "Error al agregar: ") + mensajeError(err));
    }

    setGuardando(false);
  };

  // ── ELIMINAR ─────────────────────────────
  const borrarEmpleado = async (e) => {
    if (!window.confirm(`¿Eliminar a ${e.nombre_completo}?`)) return;
    setError(null);
    try {
      await eliminarEmpleado(e.id_empleado);
      await cargarEmpleados();
    } catch (err) {
      setError("Error al eliminar: " + mensajeError(err));
    }
  };

  const setCampo = (campo) => (ev) => setForm({ ...form, [campo]: ev.target.value });

  // En modo Contadora solo estos dos campos son editables
  const bloqueado = (campo) =>
    !esAdmin && !["tipo_contrato", "fecha_terminacion"].includes(campo);

  const estiloInput = (campo) => (bloqueado(campo) ? inputBloqueado : inputStyle);

  // Si el empleado tiene un tipo de contrato que no está en la lista, se agrega para no perderlo
  const opcionesContrato = TIPOS_CONTRATO.includes(form.tipo_contrato) || !form.tipo_contrato
    ? TIPOS_CONTRATO
    : [...TIPOS_CONTRATO, form.tipo_contrato];

  const columnas = [
    "ID", "Cédula", "Nombre", "Cargo", "Rol", "Tipo Contrato",
    "Salario", "F. Contratación", "F. Terminación", "Acciones",
  ];

  // ── RENDER ───────────────────────────────
  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* ENCABEZADO */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Gestión de Empleados{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              - {esAdmin ? "Administra el personal de la empresa" : "Consulta el personal de la empresa"}
            </span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>

        {esAdmin && (
          <button
            className="btn d-flex align-items-center gap-2 fw-semibold"
            onClick={abrirAgregar}
            style={{ background: BTN_GRAD, color: "#fff", borderRadius: "8px", padding: "8px 18px 8px 8px", border: "none", boxShadow: "0 3px 12px rgba(140,107,63,0.55)" }}
          >
            <span className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.25)" }}>
              <Plus size={14} />
            </span>
            Agregar Empleado
          </button>
        )}
      </div>

      {/* TARJETAS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="rounded-4 shadow-sm"
            style={{ backgroundColor: "#fffdf8", padding: "18px 20px", border: `1.5px solid ${card.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <small style={{ color: card.color, fontSize: "13px", fontWeight: 600 }}>{card.label}</small>
              <h3 style={{ fontSize: "26px", fontWeight: "bold", color: card.color, margin: "4px 0" }}>{card.valor}</h3>
              <small style={{ color: "#6b7280", fontSize: "12px" }}>{card.sublabel}</small>
            </div>
            <card.Icon size={20} color={card.color} />
          </div>
        ))}
      </div>

      {/* BÚSQUEDA */}
      <div className="p-4 rounded-4 shadow-sm mb-4" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>
        <div style={{ position: "relative" }}>
          <Search size={16} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar por nombre, cédula, cargo o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: "36px", paddingTop: "10px", paddingBottom: "10px" }}
          />
        </div>
      </div>

      {/* ERROR (fuera del modal) */}
      {error && !mostrarModal && (
        <div className="alert alert-danger rounded-4" style={{ fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center p-3">
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Empleados Registrados</h6>
          <small style={{ color: "#6b7280" }}>{filtrados.length} empleado{filtrados.length !== 1 ? "s" : ""}</small>
        </div>

        {cargando ? (
          <div className="text-center py-5 text-muted">Cargando empleados...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Users size={40} className="mb-2 opacity-50" />
            <p>No se encontraron empleados.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ minWidth: 1100, backgroundColor: "#fffdf8" }}>
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {columnas.map((h, i) => (
                    <th key={h} className={i === 0 ? "ps-3" : ""} style={{ backgroundColor: ENCABEZADO, color: TEXTO_ENC, fontSize: "13px", border: "none", padding: "12px 8px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((e) => (
                  <tr key={e.id_empleado} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8", opacity: estaActivo(e) ? 1 : 0.6 }}>

                    <td className="ps-3 fw-bold" style={{ fontSize: 13, color: DORADO_OSCURO }}>#{e.id_empleado}</td>
                    <td style={{ fontSize: 13, color: "#374151" }}>{e.cedula}</td>
                    <td style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{e.nombre_completo}</td>

                    <td>
                      <span style={{ background: "#f0ece4", color: "#374151", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600 }}>
                        {e.cargo}
                      </span>
                    </td>

                    {/* Rol */}
                    <td>
                      <span style={{ border: `1.5px solid ${DORADO}`, color: DORADO_OSCURO, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                        {e.roles?.nombre_rol || "Sin rol"}
                      </span>
                    </td>

                    <td>
                      <span style={{ background: "#fdf3da", color: DORADO_OSCURO, borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 600, border: `1px solid ${DORADO_CLARO}` }}>
                        {e.tipo_contrato}
                      </span>
                    </td>

                    <td style={{ fontWeight: 700, color: DORADO_OSCURO, fontSize: 13 }}>{fmt(e.salario)}</td>

                    <td>
                      <div className="d-flex align-items-center gap-2" style={{ color: "#374151", fontSize: 13 }}>
                        <CalendarDays size={15} color="#6b7280" />
                        {formatFecha(e.fecha_contratacion)}
                      </div>
                    </td>

                    <td style={{ fontSize: 13, color: "#374151" }}>{formatFecha(e.fecha_terminacion)}</td>

                    <td>
                     <div className="d-flex gap-3">
  <Eye size={19} style={{ cursor: "pointer", color: "#555" }} title="Ver" onClick={() => setVerEmpleado(e)} />
  {(esAdmin || !soloLectura) && (
    <Pencil size={19} style={{ cursor: "pointer", color: DORADO_OSCURO }} title={esAdmin ? "Editar" : "Editar contrato"} onClick={() => abrirEditar(e)} />
  )}
  {esAdmin && (
    <Trash2 size={19} style={{ cursor: "pointer", color: "#c0392b" }} title="Eliminar" onClick={() => borrarEmpleado(e)} />
  )}
</div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL VER */}
      {verEmpleado && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={() => setVerEmpleado(null)}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <button
              onClick={() => setVerEmpleado(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X size={18} />
            </button>

            <h5 className="fw-bold mb-1">Detalle del Empleado</h5>
            <div style={{ width: 40, height: 3, background: DORADO, borderRadius: 10, marginBottom: 20 }} />

            {[
              ["ID",                 `#${verEmpleado.id_empleado}`],
              ["Cédula",             verEmpleado.cedula],
              ["Nombre Completo",    verEmpleado.nombre_completo],
              ["Cargo",              verEmpleado.cargo],
              ["Rol",                verEmpleado.roles?.nombre_rol || "Sin rol"],
              ["Tipo de Contrato",   verEmpleado.tipo_contrato?.replace(/_/g, " ")],
              ["Salario",            fmt(verEmpleado.salario)],
              ["Fecha Contratación", formatFecha(verEmpleado.fecha_contratacion)],
              ["Fecha Terminación",  formatFecha(verEmpleado.fecha_terminacion)],
              ["Estado",             estaActivo(verEmpleado) ? "Activo" : "Terminado"],
            ].map(([label, valor]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "#111827", fontWeight: 600 }}>{valor}</span>
              </div>
            ))}

            <button onClick={() => setVerEmpleado(null)} className="btn btn-secondary w-100 mt-3">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR */}
      {mostrarModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={cerrarModal}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: 460, maxHeight: "92vh", overflowY: "auto", position: "relative" }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <button
              onClick={cerrarModal}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X size={18} />
            </button>

            <h5 className="fw-bold mb-1">
              {!esAdmin ? "Editar Contrato" : modoEdicion ? "Editar Empleado" : "Agregar Empleado"}
            </h5>
            <div style={{ width: 40, height: 3, background: BTN_GRAD, borderRadius: 10, marginBottom: 16 }} />

            {!esAdmin && (
              <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
                Solo puedes modificar el <strong>tipo de contrato</strong> y la <strong>fecha de terminación</strong>.
              </p>
            )}

            {error && <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>{error}</div>}

            <form onSubmit={guardarEmpleado}>

              <label style={labelStyle}>Cédula</label>
              <input type="text" inputMode="numeric" required placeholder="Cédula" value={form.cedula}
                onChange={setCampo("cedula")} disabled={bloqueado("cedula")} style={estiloInput("cedula")} />

              <label style={labelStyle}>Nombre completo</label>
              <input type="text" required placeholder="Nombre completo" value={form.nombre_completo}
                onChange={setCampo("nombre_completo")} disabled={bloqueado("nombre_completo")} style={estiloInput("nombre_completo")} />

              <label style={labelStyle}>Cargo</label>
              <input type="text" required placeholder="Cargo" value={form.cargo}
                onChange={setCampo("cargo")} disabled={bloqueado("cargo")} style={estiloInput("cargo")} />

              <label style={labelStyle}>Rol</label>
              {esAdmin ? (
                <select value={form.id_rol} onChange={setCampo("id_rol")} style={inputStyle}>
                  <option value="">Sin rol</option>
                  {roles.map((r) => (
                    <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                  ))}
                </select>
              ) : (
                <input type="text" disabled style={inputBloqueado}
                  value={empleados.find((e) => e.id_empleado === empleadoId)?.roles?.nombre_rol || "Sin rol"} />
              )}

              <label style={labelStyle}>Salario</label>
              <input type="number" min="0" step="1" required placeholder="Salario" value={form.salario}
                onChange={setCampo("salario")} disabled={bloqueado("salario")} style={estiloInput("salario")} />

              <label style={labelStyle}>Fecha de contratación</label>
              <input type="date" required value={form.fecha_contratacion}
                onChange={setCampo("fecha_contratacion")} disabled={bloqueado("fecha_contratacion")} style={estiloInput("fecha_contratacion")} />

              <label style={labelStyle}>Tipo de contrato</label>
              <select value={form.tipo_contrato} onChange={setCampo("tipo_contrato")} style={inputStyle}>
                {opcionesContrato.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <label style={labelStyle}>Fecha de terminación <span style={{ fontWeight: 400, color: "#9ca3af" }}>(dejar vacía si sigue activo)</span></label>
              <input type="date" value={form.fecha_terminacion} min={form.fecha_contratacion || undefined}
                onChange={setCampo("fecha_terminacion")} style={inputStyle} />

              <div className="d-flex justify-content-end gap-2 mt-2">
                <button type="button" onClick={cerrarModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={guardando} className="btn d-flex align-items-center gap-2 fw-semibold"
                  style={{ background: BTN_GRAD, color: "#fff", borderRadius: "8px", border: "none", opacity: guardando ? 0.7 : 1 }}>
                  <Save size={15} /> {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}