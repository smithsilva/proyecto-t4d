import { useState, useEffect } from "react";
import { supabase } from "../../Supabase/SupabaseClient";

// ─── Iconos ───────────────────────────────────────────────────────────────────

const TruckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h4.385a1 1 0 0 1 .864 .496l1.751 2.989" />
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
  </svg>
);
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="12" cy="12" r="9" /><polygon points="10,8 16,12 10,16" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const TriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const WifiIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
);
const CashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

// ─── Estilos ──────────────────────────────────────────────────────────────────

const estadoStyle = {
  Pendiente:    { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" },
  "En proceso": { background: "#e6f1fb", color: "#185FA5", border: "1px solid #85B7EB" },
  Finalizada:   { background: "#EAF3DE", color: "#3B6D11", border: "1px solid #97C459" },
};

const prioridadStyle = {
  Alta:  { background: "#B89B6A", color: "#2a1f0e" },
  Media: { background: "#374151", color: "#fff"    },
  Baja:  { background: "#e5e7eb", color: "#374151" },
};

const FORM_EMPTY = {
  vehiculo:       "",
  tipo_trabajo:   "Mantenimiento",
  descripcion:    "",
  prioridad:      "Alta",
  fecha_limite:   "",
  costo:          "",
  id_metodo_pago: "",
};

const fmtFecha = (f) => {
  if (!f) return "—";
  const [y, m, d] = f.split("-");
  return `${d}/${m}/${y}`;
};

const fmtCOP = (v) =>
  v != null && v !== ""
    ? `$ ${Number(v).toLocaleString("es-CO")}`
    : "—";

const labelStyle = {
  display: "block", fontSize: 12, color: "#6b7280", marginBottom: 4, marginTop: 2,
};

const inputStyle = {
  width: "100%", padding: "9px 10px", marginBottom: 12, borderRadius: 8,
  border: "1px solid #ddd", fontSize: 13, outline: "none", background: "#fff",
  color: "#111", fontFamily: "inherit", boxSizing: "border-box",
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AsignacionTareas() {
  const [busqueda,      setBusqueda]      = useState("");
  const [asignaciones,  setAsignaciones]  = useState([]);
  const [mecanicos,     setMecanicos]     = useState([]);
  const [metodosPago,   setMetodosPago]   = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [cargandoMec,   setCargandoMec]   = useState(false);
  const [guardando,     setGuardando]     = useState(false);
  const [error,         setError]         = useState(null);
  const [modalNueva,    setModalNueva]    = useState(false);
  const [form,          setForm]          = useState(FORM_EMPTY);

  useEffect(() => { cargarAsignaciones(); }, []);

  // ── Carga asignaciones ────────────────────────────────────────────────────

  const cargarAsignaciones = async () => {
    setCargando(true);
    setError(null);

    const { data, error } = await supabase
      .from("asignaciones_tareas")
      .select(`
        id_asignacion,
        vehiculo,
        tipo_trabajo,
        descripcion,
        prioridad,
        fecha_limite,
        estado,
        costo,
        metodos_pago(
          id_metodo_pago,
          nombre_metodo,
          permite_online
        ),
        usuarios!fk_mecanico(
          id_usuario,
          username
        )
      `)
      .order("id_asignacion", { ascending: false });

    if (error) {
      setError("No se pudieron cargar las asignaciones: " + error.message);
    } else {
      setAsignaciones(data || []);
    }
    setCargando(false);
  };

  // ── Modal ─────────────────────────────────────────────────────────────────

  const abrirModal = async () => {
    setForm(FORM_EMPTY);
    setMecanicos([]);
    setMetodosPago([]);
    setModalNueva(true);
    await Promise.all([cargarMecanicos(), cargarMetodosPago()]);
  };

  const cerrarModal = () => {
    setModalNueva(false);
    setForm(FORM_EMPTY);
    setMecanicos([]);
    setMetodosPago([]);
  };

  const cargarMecanicos = async () => {
    setCargandoMec(true);
    const { data, error: err } = await supabase
      .from("usuarios")
      .select("id_usuario, username")
      .eq("rol", "Mecanico")
      .eq("activo", true);

    setMecanicos(err ? [] : (data || []));
    setCargandoMec(false);
  };

  const cargarMetodosPago = async () => {
    const { data, error: err } = await supabase
      .from("metodos_pago")
      .select("id_metodo_pago, nombre_metodo, permite_online")
      .order("id_metodo_pago");

    if (!err && data?.length) {
      setMetodosPago(data);
      setForm((f) => ({ ...f, id_metodo_pago: String(data[0].id_metodo_pago) }));
    }
  };

  // ── Método seleccionado (para mostrar badge online) ───────────────────────

  const metodoPagoSeleccionado = metodosPago.find(
    (m) => String(m.id_metodo_pago) === String(form.id_metodo_pago)
  );

  // ── Crear asignación ──────────────────────────────────────────────────────

  const crearAsignacion = async () => {
    if (!form.vehiculo.trim())   return alert("El vehículo es obligatorio.");
    if (!form.costo || isNaN(Number(form.costo)) || Number(form.costo) <= 0)
      return alert("Ingresa un costo válido mayor a 0.");
    if (!form.id_metodo_pago)    return alert("Selecciona un método de pago.");
    if (mecanicos.length === 0)  return alert("No se encontraron mecánicos activos.");

    setGuardando(true);

    // 1️⃣ Insertar asignaciones (una por mecánico)
    const { data: asignadas, error: errInsert } = await supabase
      .from("asignaciones_tareas")
      .insert(
        mecanicos.map((m) => ({
          vehiculo:       form.vehiculo.trim(),
          tipo_trabajo:   form.tipo_trabajo,
          descripcion:    form.descripcion.trim() || null,
          id_mecanico:    m.id_usuario,
          prioridad:      form.prioridad,
          fecha_limite:   form.fecha_limite || null,
          estado:         "Pendiente",
          costo:          Number(form.costo),
          id_metodo_pago: Number(form.id_metodo_pago),
        }))
      )
      .select("id_asignacion, id_mecanico");

    if (errInsert) {
      alert("Error al guardar: " + errInsert.message);
      setGuardando(false);
      return;
    }

    // 2️⃣ Registrar movimiento contable (Egreso) — uno por asignación
    const { error: errMov } = await supabase
      .from("movimientos_contables")
      .insert(
        asignadas.map((a) => ({
          tipo_movimiento: "Egreso",
          concepto: `${form.tipo_trabajo} — Vehículo: ${form.vehiculo.trim()}`,
          id_mantenimiento: null,
          valor: Number(form.costo),
          fecha_movimiento: new Date().toISOString().split("T")[0],
          id_usuario_registro: null, // reemplaza con el id del usuario en sesión si lo tienes
        }))
      );

    if (errMov) {
      console.warn("Asignación creada pero error en movimiento contable:", errMov.message);
    }

    // 3️⃣ Notificaciones
    await supabase.from("notificaciones").insert(
      asignadas.map((a) => ({
        titulo:        "Nueva asignación",
        descripcion:   `Nuevo trabajo de ${form.tipo_trabajo} — Vehículo: ${form.vehiculo.trim()}`,
        leido:         false,
        rol_destino:   "Mecanico",
        id_usuario:    a.id_mecanico,
        id_asignacion: a.id_asignacion,
      }))
    );

    await cargarAsignaciones();
    cerrarModal();
    setGuardando(false);
  };

  // ── Filtrado ──────────────────────────────────────────────────────────────

  const filtradas = asignaciones.filter((a) => {
    const nombreMecanico = a.usuarios?.username || "";
    return (
      (a.vehiculo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      nombreMecanico.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = [
    { label: "Pendientes",     value: asignaciones.filter((a) => a.estado === "Pendiente").length,  icon: <ClockIcon />    },
    { label: "En proceso",     value: asignaciones.filter((a) => a.estado === "En proceso").length, icon: <PlayIcon />     },
    { label: "Finalizadas",    value: asignaciones.filter((a) => a.estado === "Finalizada").length, icon: <CheckIcon />    },
    { label: "Alta prioridad", value: asignaciones.filter((a) => a.prioridad === "Alta").length,    icon: <TriangleIcon /> },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#fff", minHeight: "100vh", padding: "28px 32px", color: "#1a1a2e" }}>

      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>Asignación de Tareas</h1>
          <div style={{ width: 60, height: 3, backgroundColor: "#B89B6A", borderRadius: 10, margin: "6px 0 4px" }} />
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Gestiona las asignaciones de trabajo para los mecánicos</p>
        </div>
        <button onClick={abrirModal}
          style={{ background: "#B89B6A", color: "#2a1f0e", border: "none", padding: "10px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <PlusIcon /> Nueva Asignación
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1.5px solid #B89B6A", borderRadius: 16, padding: "20px 22px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
              <span style={{ color: "#B89B6A" }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Buscador */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", marginBottom: 24, border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb", borderRadius: 20, padding: "8px 14px" }}>
          <SearchIcon />
          <input type="text" placeholder="Buscar por vehículo o mecánico..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: 13 }} />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #e5e7eb", overflowX: "auto" }}>

        {cargando && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ display: "inline-block", width: 28, height: 28, border: "3px solid #e5e7eb", borderTop: "3px solid #B89B6A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: 12, color: "#9ca3af", fontSize: 13 }}>Cargando...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!cargando && error && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>
            <button onClick={cargarAsignaciones}
              style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #B89B6A", background: "#fff", color: "#B89B6A", cursor: "pointer", fontSize: 13 }}>
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Vehículo", "Tipo", "Descripción", "Mecánico", "Costo", "Método de pago", "Prioridad", "Fecha límite", "Estado"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px", fontSize: 12, color: "#666", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                    {asignaciones.length === 0 ? "No hay asignaciones aún." : "Sin resultados."}
                  </td>
                </tr>
              ) : (
                filtradas.map((a) => {
                  const metodo = a.metodos_pago;
                  return (
                    <tr key={a.id_asignacion} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#B89B6A" }}><TruckIcon /></span>
                          {a.vehiculo}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>{a.tipo_trabajo}</td>
                      <td style={{ padding: "12px", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.descripcion}>
                        {a.descripcion || "—"}
                      </td>
                      <td style={{ padding: "12px" }}>{a.usuarios?.username || "—"}</td>

                      {/* Costo */}
                      <td style={{ padding: "12px", fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap" }}>
                        {fmtCOP(a.costo)}
                      </td>

                      {/* Método de pago + badge online */}
                      <td style={{ padding: "12px" }}>
                        {metodo ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 12 }}>{metodo.nombre_metodo}</span>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              fontSize: 10, fontWeight: 600,
                              padding: "2px 8px", borderRadius: 20, width: "fit-content",
                              background: metodo.permite_online ? "#e6f1fb" : "#f3f4f6",
                              color: metodo.permite_online ? "#185FA5" : "#6b7280",
                              border: metodo.permite_online ? "1px solid #85B7EB" : "1px solid #d1d5db",
                            }}>
                              {metodo.permite_online ? <WifiIcon /> : <CashIcon />}
                              {metodo.permite_online ? "Online" : "Presencial"}
                            </span>
                          </div>
                        ) : "—"}
                      </td>

                      <td style={{ padding: "12px" }}>
                        <span style={{ ...(prioridadStyle[a.prioridad] || prioridadStyle.Baja), padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                          {a.prioridad}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>{fmtFecha(a.fecha_limite)}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ ...(estadoStyle[a.estado] || estadoStyle.Pendiente), padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                          {a.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nueva asignación */}
      {modalNueva && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, maxHeight: "90vh", overflowY: "auto" }}>
            <h5 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Nueva Asignación</h5>

            {/* Info mecánicos */}
            <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#faf7f2", border: "1px solid #e8dcc8", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#B89B6A" }}><UsersIcon /></span>
              {cargandoMec ? (
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Buscando mecánicos...</span>
              ) : mecanicos.length > 0 ? (
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  Se notificará a <strong style={{ color: "#B89B6A" }}>{mecanicos.length} mecánico{mecanicos.length > 1 ? "s" : ""}</strong>: {mecanicos.map((m) => m.username).join(", ")}
                </span>
              ) : (
                <span style={{ fontSize: 12, color: "#ef4444" }}>No se encontraron mecánicos activos</span>
              )}
            </div>

            <label style={labelStyle}>Vehículo *</label>
            <input type="text" placeholder="Ej: VT-001 - Humvee Blindado" value={form.vehiculo}
              onChange={(e) => setForm({ ...form, vehiculo: e.target.value })} style={inputStyle} />

            <label style={labelStyle}>Tipo de trabajo</label>
            <select value={form.tipo_trabajo} onChange={(e) => setForm({ ...form, tipo_trabajo: e.target.value })} style={inputStyle}>
              <option>Mantenimiento</option>
              <option>Reparación</option>
              <option>Blindamiento</option>
              <option>Inspección</option>
            </select>

            <label style={labelStyle}>Descripción</label>
            <textarea placeholder="Detalle del trabajo..." value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} />

            <label style={labelStyle}>Prioridad</label>
            <select value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })} style={inputStyle}>
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>

            <label style={labelStyle}>Fecha límite</label>
            <input type="date" value={form.fecha_limite}
              onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })} style={inputStyle} />

            {/* ── Costo ── */}
            <label style={labelStyle}>Costo del trabajo * (COP)</label>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#6b7280", pointerEvents: "none" }}>$</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.costo}
                onChange={(e) => setForm({ ...form, costo: e.target.value })}
                style={{ ...inputStyle, paddingLeft: 22, marginBottom: 0 }}
              />
            </div>

            {/* ── Método de pago ── */}
            <label style={labelStyle}>Método de pago *</label>
            <select
              value={form.id_metodo_pago}
              onChange={(e) => setForm({ ...form, id_metodo_pago: e.target.value })}
              style={inputStyle}
            >
              {metodosPago.length === 0 && <option value="">Cargando métodos...</option>}
              {metodosPago.map((m) => (
                <option key={m.id_metodo_pago} value={m.id_metodo_pago}>
                  {m.nombre_metodo}
                </option>
              ))}
            </select>

            {/* Badge online/presencial en tiempo real */}
            {metodoPagoSeleccionado && (
              <div style={{
                marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: metodoPagoSeleccionado.permite_online ? "#e6f1fb" : "#f3f4f6",
                color: metodoPagoSeleccionado.permite_online ? "#185FA5" : "#6b7280",
                border: metodoPagoSeleccionado.permite_online ? "1px solid #85B7EB" : "1px solid #d1d5db",
              }}>
                {metodoPagoSeleccionado.permite_online ? <WifiIcon /> : <CashIcon />}
                {metodoPagoSeleccionado.permite_online ? "Pago Online" : "Pago Presencial"}
              </div>
            )}

            {/* Resumen del movimiento contable que se va a crear */}
            {form.costo && Number(form.costo) > 0 && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #86efac" }}>
                <p style={{ fontSize: 11, color: "#166534", margin: 0, fontWeight: 600 }}>✓ Se registrará automáticamente en movimientos contables:</p>
                <p style={{ fontSize: 12, color: "#166534", margin: "4px 0 0" }}>
                  Egreso · {form.tipo_trabajo} {form.vehiculo ? `— ${form.vehiculo}` : ""} · <strong>{fmtCOP(form.costo)}</strong>
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button onClick={cerrarModal} disabled={guardando}
                style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>
                Cancelar
              </button>
              <button
                onClick={crearAsignacion}
                disabled={guardando || cargandoMec || mecanicos.length === 0}
                style={{
                  padding: "8px 18px", borderRadius: 8, border: "none",
                  background: (guardando || mecanicos.length === 0) ? "#d4b896" : "#B89B6A",
                  color: "#2a1f0e", fontWeight: 600,
                  cursor: (guardando || mecanicos.length === 0) ? "not-allowed" : "pointer",
                  fontSize: 13,
                }}>
                {guardando ? "Guardando..." : `Asignar a ${mecanicos.length} mecánico${mecanicos.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}