import { supabase } from "../../Supabase/SupabaseClient";
import { useState, useEffect } from "react";
import {
  UserRound, UserCheck, CalendarDays, MapPin,
  Search, Eye, Pencil, Trash2, UserPlus, X, Filter,
} from "lucide-react";

// ─── Paleta unificada con Inventario ──────────────────────────────
const DORADO        = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO  = "#e7c98a";
const FONDO         = "#f7f1e3";
const ENCABEZADO    = "#13202e";
const TEXTO_ENC     = "#e7c98a";

const TIPOS_DOC = ["CC", "CE", "NIT", "Pasaporte"];
const TIPO_DOC_LABELS = {
  CC: "Cédula (CC)", CE: "Cédula Extranjería (CE)", NIT: "NIT", Pasaporte: "Pasaporte",
};

const formatFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const [anio, mes, dia] = fechaStr.split("-");
  if (anio && mes && dia) return `${dia}/${mes}/${anio}`;
  return fechaStr;
};

const parseFecha = (fechaStr) => {
  if (!fechaStr) return null;
  if (fechaStr.includes("-")) return new Date(fechaStr);
  const [dia, mes, anio] = fechaStr.split("/");
  if (dia && mes && anio) return new Date(anio, mes - 1, dia);
  return null;
};

export default function GestionClientes() {
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState("Todos los estados");
  const [clients, setClients]         = useState([]);
  const [verCliente, setVerCliente]   = useState(null);
  const [editCliente, setEditCliente] = useState(null);
  const [editForm, setEditForm]       = useState({});
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");
  const [nuevoForm, setNuevoForm]     = useState({
    tipo_documento: "CC", numero_documento: "", nombre_completo: "",
    telefono: "", email: "", estado: "Activo",
  });

  useEffect(() => { obtenerClientes(); }, []);

  const obtenerClientes = async () => {
    const { data, error } = await supabase
      .from("clientes").select("*").order("id_cliente", { ascending: true });
    if (!error) setClients(data);
  };

  const totalClientes   = clients.length;
  const totalActivos    = clients.filter((c) => c.estado === "Activo").length;
  const ahora           = new Date();
  const estesMes        = clients.filter((c) => {
    const f = parseFecha(c.fecha_registro);
    return f && f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
  }).length;
  const totalDirecciones = clients.filter((c) => c.email && c.email.trim() !== "").length;

  const statCards = [
    { label: "Total Clientes", value: totalClientes,    sub: "registrados",      Icon: UserRound    },
    { label: "Activos",        value: totalActivos,     sub: "clientes activos",  Icon: UserCheck    },
    { label: "Este Mes",       value: estesMes,         sub: "nuevos registros",  Icon: CalendarDays },
    { label: "Direcciones",    value: totalDirecciones, sub: "registradas",       Icon: MapPin       },
  ];

  const filtered = clients.filter((c) => {
    const matchSearch =
      (c.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.numero_documento || "").includes(search) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.telefono || "").includes(search);
    return matchSearch && (filter === "Todos los estados" || c.estado === filter);
  });

  const deleteClient = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    const { error } = await supabase.from("clientes").delete().eq("id_cliente", id);
    if (!error) await obtenerClientes();
  };

  const toggleEstado = async (id) => {
    const cliente    = clients.find((c) => c.id_cliente === id);
    const nuevoEstado = cliente.estado === "Activo" ? "Inactivo" : "Activo";
    const { error } = await supabase.from("clientes").update({ estado: nuevoEstado }).eq("id_cliente", id);
    if (!error) await obtenerClientes();
  };

  const abrirEditar = (cliente) => {
    setEditCliente(cliente);
    setEditForm({ ...cliente });
    setErrorMsg("");
  };

  const guardarEditar = async () => {
    const { id_cliente, ...campos } = editForm;
    const { error } = await supabase.from("clientes").update(campos).eq("id_cliente", editCliente.id_cliente);
    if (error) {
      setErrorMsg(error.code === "23505" ? "El documento o correo ya está registrado." : "Error al guardar.");
      return;
    }
    await obtenerClientes();
    setEditCliente(null);
    setErrorMsg("");
  };

  const guardarNuevo = async () => {
    if (!nuevoForm.nombre_completo || !nuevoForm.numero_documento) return;
    setErrorMsg("");
    const { fecha_registro, ...datosAEnviar } = nuevoForm;
    const { error } = await supabase.from("clientes").insert([datosAEnviar]);
    if (error) {
      setErrorMsg(error.code === "23505" ? "El número de documento o correo ya está registrado." : "Error al guardar.");
      return;
    }
    await obtenerClientes();
    setMostrarNuevo(false);
    setNuevoForm({ tipo_documento: "CC", numero_documento: "", nombre_completo: "", telefono: "", email: "", estado: "Activo" });
  };

  // ─── Estilos compartidos ─────────────────────────────────────────
  const labelFiltro = { fontSize: "12px", fontWeight: 600, color: DORADO_OSCURO, marginBottom: "4px", display: "block" };
  const formInput   = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, color: "#111827", outline: "none", background: "#fafafa", marginBottom: 12 };
  const fieldLabel  = { fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" };
  const fieldValue  = { fontSize: 14, color: "#111827", padding: "8px 0", borderBottom: "1px solid #f0f0f0" };
  const btnPrimario = { background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 12px rgba(140,107,63,0.45)", display: "inline-flex", alignItems: "center", gap: 6 };
  const btnCancelar = { background: "#f3f4f6", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: 50, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", flex: 1 };
  const btnGuardar  = (disabled) => ({ background: disabled ? "#d4b88a" : `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff", border: "none", borderRadius: 50, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, flex: 1 });

  // Badge Estado — píldora suave dorada
  const badgeEstado = (estado) => {
    const esActivo = estado === "Activo";
    return (
      <span
        title="Clic para cambiar estado"
        onClick={() => {}}
        style={{
          backgroundColor: esActivo ? "#f0ece4" : "#f3f4f6",
          color:           esActivo ? DORADO_OSCURO : "#6b7280",
          borderRadius: 50, padding: "4px 12px", fontSize: 12, fontWeight: 600,
          display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", userSelect: "none",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: esActivo ? DORADO_OSCURO : "#9ca3af", display: "inline-block" }} />
        {estado ?? "Activo"}
      </span>
    );
  };

  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* HEADER */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Gestión de Clientes{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>— Administración de base de datos</span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
        <button style={btnPrimario} onClick={() => { setMostrarNuevo(true); setErrorMsg(""); }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserPlus size={14} />
          </span>
          Nuevo Cliente
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="card shadow-sm rounded-4"
            style={{ padding: "18px 20px", backgroundColor: "#fffdf8", border: `1.5px solid ${DORADO_CLARO}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: DORADO_OSCURO, marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.1 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{card.sub}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f0ece4", color: DORADO_OSCURO, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <card.Icon size={18} strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="p-4 rounded-4 shadow-sm mb-4" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>
        <div className="mb-3 position-relative">
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
          <input
            className="form-control rounded-pill"
            style={{ paddingLeft: 36, paddingTop: 10, paddingBottom: 10, fontSize: 13 }}
            placeholder="Buscar por nombre, documento, teléfono o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="d-flex gap-3 flex-wrap align-items-end">
          <div style={{ flex: "1 1 150px" }}>
            <label style={labelFiltro}>Estado</label>
            <select className="form-select rounded-pill" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>Todos los estados</option>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>
          <button
            className="btn d-flex align-items-center gap-1 fw-semibold"
            style={{ color: DORADO_OSCURO, border: `1px solid ${DORADO_OSCURO}`, borderRadius: "20px", padding: "8px 16px", whiteSpace: "nowrap" }}
            onClick={() => { setSearch(""); setFilter("Todos los estados"); }}
          >
            <X size={14} /> Limpiar Filtros
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-1">
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Base de Datos de Clientes</h6>
          <small style={{ color: "#6b7280" }}>{filtered.length} clientes</small>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ backgroundColor: "#fffdf8" }}>
            <thead>
              <tr style={{ backgroundColor: ENCABEZADO }}>
                {["Tipo Doc.", "Número Documento", "Nombre Completo", "Teléfono", "Correo Electrónico", "Fecha Registro", "Estado", "Acciones"].map((h) => (
                  <th key={h} style={{ backgroundColor: ENCABEZADO, color: TEXTO_ENC, fontSize: "13px", border: "none", padding: "12px 10px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: 14 }}>No se encontraron clientes.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id_cliente} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                  <td style={{ fontSize: 13 }}>{c.tipo_documento}</td>
                  <td style={{ fontSize: 13 }}>{c.numero_documento}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{c.nombre_completo}</td>
                  <td style={{ fontSize: 13, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.telefono}</td>
                  <td style={{ fontSize: 13, color: "#374151", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</td>
                  <td style={{ fontSize: 13 }}>{formatFecha(c.fecha_registro)}</td>
                  <td>
                    <span
                      title="Clic para cambiar estado"
                      onClick={() => toggleEstado(c.id_cliente)}
                      style={{
                        backgroundColor: c.estado === "Activo" ? "#f0ece4" : "#f3f4f6",
                        color:           c.estado === "Activo" ? DORADO_OSCURO : "#6b7280",
                        borderRadius: 50, padding: "4px 12px", fontSize: 12, fontWeight: 600,
                        display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", userSelect: "none",
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.estado === "Activo" ? DORADO_OSCURO : "#9ca3af", display: "inline-block" }} />
                      {c.estado ?? "Activo"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-3 align-items-center">
                      <Eye    size={18} style={{ cursor: "pointer", color: "#555"        }} title="Ver"      onClick={() => setVerCliente(c)} />
                      <Pencil size={18} style={{ cursor: "pointer", color: DORADO_OSCURO }} title="Editar"   onClick={() => abrirEditar(c)} />
                      <Trash2 size={18} style={{ cursor: "pointer", color: "#c0392b"    }} title="Eliminar" onClick={() => deleteClient(c.id_cliente)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL VER */}
      {verCliente && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setVerCliente(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Detalle del Cliente</h5>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setVerCliente(null)} />
            </div>
            <div style={{ width: 40, height: 3, background: DORADO_OSCURO, borderRadius: 10, marginBottom: 20 }} />
            {[
              ["Tipo de Documento", TIPO_DOC_LABELS[verCliente.tipo_documento] || verCliente.tipo_documento],
              ["Número de Documento", verCliente.numero_documento],
              ["Nombre Completo", verCliente.nombre_completo],
              ["Teléfono", verCliente.telefono],
              ["Correo Electrónico", verCliente.email],
              ["Fecha de Registro", formatFecha(verCliente.fecha_registro)],
            ].map(([label, val]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <span style={fieldLabel}>{label}</span>
                <div style={fieldValue}>{val}</div>
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <span style={fieldLabel}>Estado</span>
              <div style={{ paddingTop: 6 }}>
                <span style={{ backgroundColor: verCliente.estado === "Activo" ? "#f0ece4" : "#f3f4f6", color: verCliente.estado === "Activo" ? DORADO_OSCURO : "#6b7280", borderRadius: 50, padding: "4px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  {verCliente.estado ?? "Activo"}
                </span>
              </div>
            </div>
            <button onClick={() => setVerCliente(null)} className="btn w-100 fw-semibold" style={{ background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff", borderRadius: 8 }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editCliente && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setEditCliente(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Editar Cliente</h5>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setEditCliente(null)} />
            </div>
            <div style={{ width: 40, height: 3, background: DORADO_OSCURO, borderRadius: 10, marginBottom: 20 }} />
            <label style={fieldLabel}>Tipo de Documento</label>
            <select style={formInput} value={editForm.tipo_documento} onChange={(e) => setEditForm({ ...editForm, tipo_documento: e.target.value })}>
              {TIPOS_DOC.map((t) => <option key={t} value={t}>{TIPO_DOC_LABELS[t]}</option>)}
            </select>
            <label style={fieldLabel}>Número de Documento</label>
            <input style={formInput} value={editForm.numero_documento} onChange={(e) => setEditForm({ ...editForm, numero_documento: e.target.value })} />
            <label style={fieldLabel}>Nombre Completo</label>
            <input style={formInput} value={editForm.nombre_completo} onChange={(e) => setEditForm({ ...editForm, nombre_completo: e.target.value })} />
            <label style={fieldLabel}>Teléfono</label>
            <input style={formInput} value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />
            <label style={fieldLabel}>Correo Electrónico</label>
            <input style={formInput} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <label style={fieldLabel}>Estado</label>
            <select style={formInput} value={editForm.estado} onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}>
              <option>Activo</option><option>Inactivo</option>
            </select>
            {errorMsg && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10, padding: "6px 10px", background: "#fef2f2", borderRadius: 8 }}>{errorMsg}</div>}
            <div className="d-flex gap-2 mt-2">
              <button onClick={() => { setEditCliente(null); setErrorMsg(""); }} style={btnCancelar}>Cancelar</button>
              <button onClick={guardarEditar} style={btnGuardar(false)}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO */}
      {mostrarNuevo && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setMostrarNuevo(false)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Nuevo Cliente</h5>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setMostrarNuevo(false)} />
            </div>
            <div style={{ width: 40, height: 3, background: DORADO_OSCURO, borderRadius: 10, marginBottom: 20 }} />
            <label style={fieldLabel}>Tipo de Documento</label>
            <select style={formInput} value={nuevoForm.tipo_documento} onChange={(e) => setNuevoForm({ ...nuevoForm, tipo_documento: e.target.value })}>
              {TIPOS_DOC.map((t) => <option key={t} value={t}>{TIPO_DOC_LABELS[t]}</option>)}
            </select>
            <label style={fieldLabel}>Número de Documento</label>
            <input style={formInput} placeholder="Ej: 1234567890" value={nuevoForm.numero_documento} onChange={(e) => setNuevoForm({ ...nuevoForm, numero_documento: e.target.value })} />
            <label style={fieldLabel}>Nombre Completo</label>
            <input style={formInput} placeholder="Nombre y apellidos" value={nuevoForm.nombre_completo} onChange={(e) => setNuevoForm({ ...nuevoForm, nombre_completo: e.target.value })} />
            <label style={fieldLabel}>Teléfono</label>
            <input style={formInput} placeholder="+57 300 000 0000" value={nuevoForm.telefono} onChange={(e) => setNuevoForm({ ...nuevoForm, telefono: e.target.value })} />
            <label style={fieldLabel}>Correo Electrónico</label>
            <input style={formInput} placeholder="correo@email.com" value={nuevoForm.email} onChange={(e) => setNuevoForm({ ...nuevoForm, email: e.target.value })} />
            <label style={fieldLabel}>Estado</label>
            <select style={formInput} value={nuevoForm.estado} onChange={(e) => setNuevoForm({ ...nuevoForm, estado: e.target.value })}>
              <option>Activo</option><option>Inactivo</option>
            </select>
            {errorMsg && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10, padding: "6px 10px", background: "#fef2f2", borderRadius: 8 }}>{errorMsg}</div>}
            <div className="d-flex gap-2 mt-2">
              <button onClick={() => { setMostrarNuevo(false); setErrorMsg(""); }} style={btnCancelar}>Cancelar</button>
              <button onClick={guardarNuevo} disabled={!nuevoForm.nombre_completo || !nuevoForm.numero_documento} style={btnGuardar(!nuevoForm.nombre_completo || !nuevoForm.numero_documento)}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}