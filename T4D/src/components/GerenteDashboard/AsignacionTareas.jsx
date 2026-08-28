import { useState, useEffect, useRef } from "react";
import { supabase } from "../../Supabase/SupabaseClient";
import { Filter, Search, X, Plus } from "lucide-react";

const DORADO        = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO  = "#e7c98a";
const FONDO         = "#f7f1e3";
const ENCABEZADO    = "#13202e";
const TEXTO_ENC     = "#e7c98a";

const TruckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h4.385a1 1 0 0 1 .864 .496l1.751 2.989" />
  </svg>
);
const ClockIcon    = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>);
const PlayIcon     = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><polygon points="10,8 16,12 10,16"/></svg>);
const CheckIcon    = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="20 6 9 17 4 12"/></svg>);
const TriangleIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>);
const UsersIcon    = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const WifiIcon     = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>);
const CashIcon     = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>);
const UserIcon     = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const BuildingIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/></svg>);

const estadoStyle = {
  Pendiente:    { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" },
  "En proceso": { background: "#e6f1fb", color: "#185FA5", border: "1px solid #85B7EB" },
  Finalizada:   { background: "#EAF3DE", color: "#3B6D11", border: "1px solid #97C459" },
};

const badgePrioridad = (prioridad) => {
  const map = {
    Alta:  { bg: "#f0ece4", color: DORADO_OSCURO },
    Media: { bg: "#fdf3da", color: "#b8860b"     },
    Baja:  { bg: "#f3f4f6", color: "#6b7280"     },
  };
  const s = map[prioridad] || map.Baja;
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, display: "inline-block" }}>
      {prioridad}
    </span>
  );
};

const FORM_EMPTY = {
  id_cliente:     "",
  id_mecanico:    "",
  vehiculo:       "",
  tipo_trabajo:   "Mantenimiento",
  descripcion:    "",
  prioridad:      "Alta",
  fecha_limite:   "",
  costo:          "",
  id_metodo_pago: "",
  id_sucursal:    "",
};

const fmtFecha = (f) => { if (!f) return "—"; const [y,m,d] = f.split("-"); return `${d}/${m}/${y}`; };
const fmtCOP   = (v) => v != null && v !== "" ? `$ ${Number(v).toLocaleString("es-CO")}` : "—";

const labelStyle = { display: "block", fontSize: 12, color: "#6b7280", marginBottom: 4, marginTop: 2 };
const inputStyle = { width: "100%", padding: "9px 10px", marginBottom: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 13, outline: "none", background: "#fff", color: "#111", fontFamily: "inherit", boxSizing: "border-box" };

export default function AsignacionTareas() {
  const [busqueda,         setBusqueda]         = useState("");
  const [asignaciones,     setAsignaciones]     = useState([]);
  const [mecanicos,        setMecanicos]        = useState([]);
  const [metodosPago,      setMetodosPago]      = useState([]);
  const [clientes,         setClientes]         = useState([]);
  const [sucursales,       setSucursales]       = useState([]);
  const [cargando,         setCargando]         = useState(true);
  const [cargandoMec,      setCargandoMec]      = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [cargandoSuc,      setCargandoSuc]      = useState(false);
  const [guardando,        setGuardando]        = useState(false);
  const [error,            setError]            = useState(null);
  const [modalNueva,       setModalNueva]       = useState(false);
  const [form,             setForm]             = useState(FORM_EMPTY);

  // Guard "duro" anti doble-envío: a diferencia de un estado de React,
  // un ref cambia de valor de forma inmediata y sincrónica, sin esperar
  // un re-render. Esto evita que un doble clic (o un clic mientras
  // guardando aún no se propagó al DOM) dispare el insert dos veces.
  const enviandoRef = useRef(false);

  useEffect(() => { cargarAsignaciones(); }, []);

  const cargarAsignaciones = async () => {
    setCargando(true); setError(null);
    const { data, error } = await supabase
      .from("asignaciones_tareas")
      .select(`
        id_asignacion, vehiculo, tipo_trabajo, descripcion,
        prioridad, fecha_limite, estado, costo,
        metodos_pago(id_metodo_pago, nombre_metodo, permite_online),
        usuarios!fk_mecanico(id_usuario, username),
        clientes(id_cliente, nombre_completo, tipo_documento, numero_documento),
        sucursales(id_sucursal, nombre_sucursal)
      `)
      .order("id_asignacion", { ascending: false });
    if (error) setError("No se pudieron cargar las asignaciones: " + error.message);
    else setAsignaciones(data || []);
    setCargando(false);
  };

  const abrirModal = async () => {
    setForm(FORM_EMPTY);
    setMecanicos([]);
    setMetodosPago([]);
    setClientes([]);
    setSucursales([]);
    setModalNueva(true);
    await Promise.all([cargarMecanicos(), cargarMetodosPago(), cargarClientes(), cargarSucursales()]);
  };

  const cerrarModal = () => {
    setModalNueva(false);
    setForm(FORM_EMPTY);
    setMecanicos([]);
    setMetodosPago([]);
    setClientes([]);
    setSucursales([]);
    enviandoRef.current = false;
  };

  const cargarMecanicos = async () => {
    setCargandoMec(true);
    const { data, error: err } = await supabase
      .from("usuarios")
      .select("id_usuario, username")
      .eq("rol", "Mecanico")
      .eq("activo", true)
      .order("username", { ascending: true });

    // Deduplicar por id_usuario por si la consulta trae filas repetidas.
    const unicos = Array.from(
      new Map((data || []).map((m) => [m.id_usuario, m])).values()
    );

    setMecanicos(err ? [] : unicos);
    setCargandoMec(false);

    // Si solo hay un mecánico activo, se preselecciona automáticamente
    // para agilizar el formulario; si hay varios, el usuario elige.
    if (!err && unicos.length === 1) {
      setForm((f) => ({ ...f, id_mecanico: String(unicos[0].id_usuario) }));
    }
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

  const cargarClientes = async () => {
    setCargandoClientes(true);
    const { data, error: err } = await supabase
      .from("clientes")
      .select("id_cliente, nombre_completo, tipo_documento, numero_documento, telefono, email, estado")
      .order("nombre_completo", { ascending: true });
    setClientes(err ? [] : (data || []));
    setCargandoClientes(false);
  };

  const cargarSucursales = async () => {
    setCargandoSuc(true);
    const { data, error: err } = await supabase
      .from("sucursales")
      .select("id_sucursal, nombre_sucursal")
      .order("id_sucursal", { ascending: true });
    setSucursales(err ? [] : (data || []));
    setCargandoSuc(false);
  };

  const metodoPagoSeleccionado = metodosPago.find(
    (m) => String(m.id_metodo_pago) === String(form.id_metodo_pago)
  );

  const clienteSeleccionado = clientes.find(
    (c) => String(c.id_cliente) === String(form.id_cliente)
  );

  const mecanicoSeleccionado = mecanicos.find(
    (m) => String(m.id_usuario) === String(form.id_mecanico)
  );

  const crearAsignacion = async () => {
    // 1) Bloqueo inmediato contra doble clic / doble submit
    if (enviandoRef.current) return;

    if (!form.vehiculo.trim())                                               return alert("El vehículo es obligatorio.");
    if (!form.id_mecanico)                                                   return alert("Selecciona el mecánico a asignar.");
    if (!form.costo || isNaN(Number(form.costo)) || Number(form.costo) <= 0) return alert("Ingresa un costo válido.");
    if (!form.id_metodo_pago)                                                return alert("Selecciona un método de pago.");
    if (!form.id_sucursal)                                                   return alert("Selecciona la sucursal.");

    enviandoRef.current = true;
    setGuardando(true);

    try {
      // Insert único: una sola asignación, para el mecánico elegido.
      const { data: asignada, error: errInsert } = await supabase
        .from("asignaciones_tareas")
        .insert([{
          id_cliente:     form.id_cliente ? Number(form.id_cliente) : null,
          vehiculo:       form.vehiculo.trim(),
          tipo_trabajo:   form.tipo_trabajo,
          descripcion:    form.descripcion.trim() || null,
          id_mecanico:    Number(form.id_mecanico),
          prioridad:      form.prioridad,
          fecha_limite:   form.fecha_limite || null,
          estado:         "Pendiente",
          costo:          Number(form.costo),
          id_metodo_pago: Number(form.id_metodo_pago),
          id_sucursal:    Number(form.id_sucursal),
        }])
        .select("id_asignacion, id_mecanico")
        .single();

      if (errInsert) {
        alert("Error al guardar: " + errInsert.message);
        return;
      }

      const parteCliente = clienteSeleccionado
        ? ` | Cliente: ${clienteSeleccionado.nombre_completo} (${clienteSeleccionado.tipo_documento} ${clienteSeleccionado.numero_documento})`
        : "";

      const conceptoContable = `${form.tipo_trabajo} — Vehículo: ${form.vehiculo.trim()}${
        clienteSeleccionado ? ` — Cliente: ${clienteSeleccionado.nombre_completo}` : ""
      }`;

      // Un solo movimiento contable para la única asignación creada.
      const { error: errMov } = await supabase.from("movimientos_contables").insert([{
        tipo_movimiento:     "Egreso",
        concepto:            conceptoContable,
        id_asignacion:       asignada.id_asignacion,
        id_mantenimiento:    null,
        valor:               Number(form.costo),
        fecha_movimiento:    new Date().toISOString().split("T")[0],
        id_usuario_registro: null,
      }]);
      if (errMov) console.error("Error creando movimiento contable:", errMov.message);

      // Una sola notificación, para el mecánico asignado.
      const { error: errNotif } = await supabase.from("notificaciones").insert([{
        titulo:        "Nueva asignación",
        descripcion:   `Nuevo trabajo de ${form.tipo_trabajo} — Vehículo: ${form.vehiculo.trim()}${parteCliente}`,
        leido:         false,
        rol_destino:   "Mecanico",
        id_usuario:    asignada.id_mecanico,
        id_asignacion: asignada.id_asignacion,
      }]);
      if (errNotif) console.error("Error creando notificación:", errNotif.message);

      await cargarAsignaciones();
      cerrarModal();
    } finally {
      setGuardando(false);
      enviandoRef.current = false;
    }
  };

  const filtradas = asignaciones.filter((a) => {
    const mec     = a.usuarios?.username || "";
    const cliente = a.clientes?.nombre_completo || "";
    const sucursal = a.sucursales?.nombre_sucursal || "";
    return (
      (a.vehiculo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      mec.toLowerCase().includes(busqueda.toLowerCase())                ||
      cliente.toLowerCase().includes(busqueda.toLowerCase())            ||
      sucursal.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const stats = [
    { label: "Pendientes",     value: asignaciones.filter((a) => a.estado === "Pendiente").length,  icon: <ClockIcon />    },
    { label: "En proceso",     value: asignaciones.filter((a) => a.estado === "En proceso").length, icon: <PlayIcon />     },
    { label: "Finalizadas",    value: asignaciones.filter((a) => a.estado === "Finalizada").length, icon: <CheckIcon />    },
    { label: "Alta prioridad", value: asignaciones.filter((a) => a.prioridad === "Alta").length,    icon: <TriangleIcon /> },
  ];

  const btnPrimario = {
    background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff",
    border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", boxShadow: "0 3px 12px rgba(140,107,63,0.45)",
    display: "inline-flex", alignItems: "center", gap: 6,
  };

  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Asignación de Tareas{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>— Gestiona el trabajo de los mecánicos</span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
        <button style={btnPrimario} onClick={abrirModal}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={14} />
          </span>
          Nueva Asignación
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} className="card shadow-sm rounded-4"
            style={{ padding: "20px 22px", backgroundColor: "#fffdf8", border: `1.5px solid ${DORADO_CLARO}` }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: 13, fontWeight: 500, color: DORADO_OSCURO }}>{s.label}</span>
              <span style={{ color: DORADO }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="p-4 rounded-4 shadow-sm mb-4" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>
        <div className="position-relative">
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
          <input
            type="text"
            className="form-control rounded-pill"
            style={{ paddingLeft: 36, paddingTop: 10, paddingBottom: 10, fontSize: 13 }}
            placeholder="Buscar por vehículo, mecánico, cliente o sucursal..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {busqueda && (
          <div className="d-flex justify-content-end mt-2">
            <button className="btn d-flex align-items-center gap-1 fw-semibold"
              style={{ color: DORADO_OSCURO, border: `1px solid ${DORADO_OSCURO}`, borderRadius: "20px", padding: "6px 14px" }}
              onClick={() => setBusqueda("")}>
              <X size={13} /> Limpiar
            </button>
          </div>
        )}
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        {cargando ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <div style={{ display: "inline-block", width: 28, height: 28, border: `3px solid ${DORADO_CLARO}`, borderTop: `3px solid ${DORADO_OSCURO}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: 12, color: "#9ca3af", fontSize: 13 }}>Cargando...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>
            <button onClick={cargarAsignaciones} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${DORADO_OSCURO}`, background: "#fff", color: DORADO_OSCURO, cursor: "pointer", fontSize: 13 }}>Reintentar</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ backgroundColor: "#fffdf8" }}>
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["Cliente", "Vehículo", "Tipo", "Descripción", "Mecánico", "Sucursal", "Costo", "Método de pago", "Prioridad", "Fecha límite", "Estado"].map((h) => (
                    <th key={h} style={{ backgroundColor: ENCABEZADO, color: TEXTO_ENC, fontSize: "13px", border: "none", padding: "12px 10px", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr><td colSpan={11} style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                    {asignaciones.length === 0 ? "No hay asignaciones aún." : "Sin resultados."}
                  </td></tr>
                ) : filtradas.map((a) => {
                  const metodo   = a.metodos_pago;
                  const cliente  = a.clientes;
                  const sucursal = a.sucursales;
                  return (
                    <tr key={a.id_asignacion} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                      {/* Cliente */}
                      <td style={{ padding: "12px 10px", minWidth: 160 }}>
                        {cliente ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{cliente.nombre_completo}</span>
                            <span style={{ fontSize: 11, color: "#6b7280" }}>{cliente.tipo_documento} {cliente.numero_documento}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>Sin cliente</span>
                        )}
                      </td>
                      {/* Vehículo */}
                      <td style={{ padding: "12px 10px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ color: DORADO_OSCURO }}><TruckIcon /></span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{a.vehiculo}</span>
                        </div>
                      </td>
                      {/* Tipo */}
                      <td style={{ padding: "12px 10px", fontSize: 13 }}>{a.tipo_trabajo}</td>
                      {/* Descripción */}
                      <td style={{ padding: "12px 10px", fontSize: 13, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#6b7280" }} title={a.descripcion}>{a.descripcion || "—"}</td>
                      {/* Mecánico */}
                      <td style={{ padding: "12px 10px", fontSize: 13 }}>{a.usuarios?.username || "—"}</td>
                      {/* Sucursal */}
                      <td style={{ padding: "12px 10px" }}>
                        {sucursal ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ color: DORADO_OSCURO }}><BuildingIcon /></span>
                            <span style={{ fontSize: 13 }}>{sucursal.nombre_sucursal}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>—</span>
                        )}
                      </td>
                      {/* Costo */}
                      <td style={{ padding: "12px 10px", fontWeight: 600, fontSize: 13, color: "#1f2937", whiteSpace: "nowrap" }}>{fmtCOP(a.costo)}</td>
                      {/* Método de pago */}
                      <td style={{ padding: "12px 10px" }}>
                        {metodo ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 12 }}>{metodo.nombre_metodo}</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, width: "fit-content", background: metodo.permite_online ? "#e6f1fb" : "#f3f4f6", color: metodo.permite_online ? "#185FA5" : "#6b7280", border: metodo.permite_online ? "1px solid #85B7EB" : "1px solid #d1d5db" }}>
                              {metodo.permite_online ? <WifiIcon /> : <CashIcon />}
                              {metodo.permite_online ? "Online" : "Presencial"}
                            </span>
                          </div>
                        ) : "—"}
                      </td>
                      {/* Prioridad */}
                      <td style={{ padding: "12px 10px" }}>{badgePrioridad(a.prioridad)}</td>
                      {/* Fecha límite */}
                      <td style={{ padding: "12px 10px", fontSize: 13, color: "#6b7280" }}>{fmtFecha(a.fecha_limite)}</td>
                      {/* Estado */}
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ ...(estadoStyle[a.estado] || estadoStyle.Pendiente), padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                          {a.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL NUEVA ASIGNACIÓN */}
      {modalNueva && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1050 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 480, maxHeight: "90vh", overflowY: "auto" }}>

            <div className="d-flex justify-content-between align-items-center mb-1">
              <h5 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Nueva Asignación</h5>
              <X size={20} style={{ cursor: "pointer", color: "#9ca3af" }} onClick={cerrarModal} />
            </div>
            <div style={{ width: 40, height: 3, background: DORADO_OSCURO, borderRadius: 10, marginBottom: 16 }} />

            {/* Selección de mecánico */}
            <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 10, background: "#faf7f2", border: `1px solid ${DORADO_CLARO}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ color: DORADO_OSCURO }}><UsersIcon /></span>
                <span style={{ fontSize: 13, fontWeight: 600, color: DORADO_OSCURO }}>Mecánico asignado</span>
              </div>
              {cargandoMec ? (
                <div style={{ fontSize: 12, color: "#9ca3af", padding: "8px 0" }}>Buscando mecánicos...</div>
              ) : mecanicos.length === 0 ? (
                <div style={{ fontSize: 12, color: "#ef4444" }}>No se encontraron mecánicos activos</div>
              ) : (
                <select value={form.id_mecanico} onChange={(e) => setForm({ ...form, id_mecanico: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }}>
                  <option value="">— Selecciona mecánico —</option>
                  {mecanicos.map((m) => (
                    <option key={m.id_usuario} value={m.id_usuario}>{m.username}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Sucursal */}
            <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 10, background: "#faf7f2", border: `1px solid ${DORADO_CLARO}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ color: DORADO_OSCURO }}><BuildingIcon /></span>
                <span style={{ fontSize: 13, fontWeight: 600, color: DORADO_OSCURO }}>Sucursal del mantenimiento</span>
              </div>
              {cargandoSuc ? (
                <div style={{ fontSize: 12, color: "#9ca3af", padding: "8px 0" }}>Cargando sucursales...</div>
              ) : (
                <select value={form.id_sucursal} onChange={(e) => setForm({ ...form, id_sucursal: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }}>
                  <option value="">— Selecciona sucursal —</option>
                  {sucursales.map((s) => (
                    <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre_sucursal}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Cliente */}
            <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 10, background: "#faf7f2", border: `1px solid ${DORADO_CLARO}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ color: DORADO_OSCURO }}><UserIcon /></span>
                <span style={{ fontSize: 13, fontWeight: 600, color: DORADO_OSCURO }}>Cliente del mantenimiento</span>
              </div>
              {cargandoClientes ? (
                <div style={{ fontSize: 12, color: "#9ca3af", padding: "8px 0" }}>Cargando clientes...</div>
              ) : (
                <select value={form.id_cliente} onChange={(e) => setForm({ ...form, id_cliente: e.target.value })} style={{ ...inputStyle, marginBottom: clienteSeleccionado ? 10 : 0 }}>
                  <option value="">— Sin cliente asignado (opcional) —</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre_completo} · {c.tipo_documento} {c.numero_documento}
                      {c.estado === "Inactivo" ? " (Inactivo)" : ""}
                    </option>
                  ))}
                </select>
              )}
              {clienteSeleccionado && (
                <div style={{ background: "#fff", border: `1px solid ${DORADO_CLARO}`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{clienteSeleccionado.nombre_completo}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: clienteSeleccionado.estado === "Activo" ? "#f0ece4" : "#f3f4f6", color: clienteSeleccionado.estado === "Activo" ? DORADO_OSCURO : "#6b7280" }}>
                      {clienteSeleccionado.estado}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{clienteSeleccionado.tipo_documento} · {clienteSeleccionado.numero_documento}</div>
                  {clienteSeleccionado.telefono && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>📞 {clienteSeleccionado.telefono}</div>}
                  {clienteSeleccionado.email    && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>✉ {clienteSeleccionado.email}</div>}
                </div>
              )}
            </div>

            <label style={labelStyle}>Vehículo *</label>
            <input type="text" placeholder="Ej: VT-001 - Humvee Blindado" value={form.vehiculo} onChange={(e) => setForm({ ...form, vehiculo: e.target.value })} style={inputStyle} />

            <label style={labelStyle}>Tipo de trabajo</label>
            <select value={form.tipo_trabajo} onChange={(e) => setForm({ ...form, tipo_trabajo: e.target.value })} style={inputStyle}>
              <option>Mantenimiento</option><option>Reparación</option><option>Blindamiento</option><option>Inspección</option>
            </select>

            <label style={labelStyle}>Descripción</label>
            <textarea placeholder="Detalle del trabajo..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} />

            <label style={labelStyle}>Prioridad</label>
            <select value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })} style={inputStyle}>
              <option>Alta</option><option>Media</option><option>Baja</option>
            </select>

            <label style={labelStyle}>Fecha límite</label>
            <input type="date" value={form.fecha_limite} onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })} style={inputStyle} />

            <label style={labelStyle}>Costo del trabajo * (COP)</label>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#6b7280" }}>$</span>
              <input type="number" min="0" placeholder="0" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} style={{ ...inputStyle, paddingLeft: 22, marginBottom: 0 }} />
            </div>

            <label style={labelStyle}>Método de pago *</label>
            <select value={form.id_metodo_pago} onChange={(e) => setForm({ ...form, id_metodo_pago: e.target.value })} style={inputStyle}>
              {metodosPago.length === 0 && <option value="">Cargando métodos...</option>}
              {metodosPago.map((m) => (<option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre_metodo}</option>))}
            </select>

            {metodoPagoSeleccionado && (
              <div style={{ marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: metodoPagoSeleccionado.permite_online ? "#e6f1fb" : "#f3f4f6", color: metodoPagoSeleccionado.permite_online ? "#185FA5" : "#6b7280", border: metodoPagoSeleccionado.permite_online ? "1px solid #85B7EB" : "1px solid #d1d5db" }}>
                {metodoPagoSeleccionado.permite_online ? <WifiIcon /> : <CashIcon />}
                {metodoPagoSeleccionado.permite_online ? "Pago Online" : "Pago Presencial"}
              </div>
            )}

            {form.costo && Number(form.costo) > 0 && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #86efac" }}>
                <p style={{ fontSize: 11, color: "#166534", margin: 0, fontWeight: 600 }}>✓ Se registrará automáticamente en movimientos contables:</p>
                <p style={{ fontSize: 12, color: "#166534", margin: "4px 0 0" }}>
                  Egreso · {form.tipo_trabajo} {form.vehiculo ? `— ${form.vehiculo}` : ""}
                  {clienteSeleccionado ? ` — Cliente: ${clienteSeleccionado.nombre_completo}` : ""} · <strong>{fmtCOP(form.costo)}</strong>
                </p>
              </div>
            )}

            <div className="d-flex gap-2 mt-2">
              <button onClick={cerrarModal} disabled={guardando} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, flex: 1 }}>Cancelar</button>
              <button
                onClick={crearAsignacion}
                disabled={guardando || cargandoMec || mecanicos.length === 0 || !form.id_mecanico}
                style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: (guardando || mecanicos.length === 0 || !form.id_mecanico) ? "#d4b896" : `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff", fontWeight: 600, cursor: (guardando || mecanicos.length === 0 || !form.id_mecanico) ? "not-allowed" : "pointer", fontSize: 13, flex: 1 }}
              >
                {guardando
                  ? "Guardando..."
                  : mecanicoSeleccionado
                    ? `Asignar a ${mecanicoSeleccionado.username}`
                    : "Asignar tarea"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}