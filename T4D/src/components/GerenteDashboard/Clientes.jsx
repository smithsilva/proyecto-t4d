import { supabase } from "../../Supabase/SupabaseClient";
import { useState, useEffect } from "react";
import {
  UserRound,
  UserCheck,
  CalendarDays,
  MapPin,
  Search,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

const TIPOS_DOC = ["CC", "CE", "NIT", "Pasaporte"];

const TIPO_DOC_LABELS = {
  CC: "Cédula (CC)",
  CE: "Cédula Extranjería (CE)",
  NIT: "NIT",
  Pasaporte: "Pasaporte",
};

// Convierte fecha DATE de Supabase (YYYY-MM-DD) a formato visual (DD/MM/YYYY)
const formatFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const [anio, mes, dia] = fechaStr.split("-");
  if (anio && mes && dia) return `${dia}/${mes}/${anio}`;
  return fechaStr;
};

// Convierte DD/MM/YYYY o YYYY-MM-DD a objeto Date para comparar mes
const parseFecha = (fechaStr) => {
  if (!fechaStr) return null;
  if (fechaStr.includes("-")) return new Date(fechaStr);
  const [dia, mes, anio] = fechaStr.split("/");
  if (dia && mes && anio) return new Date(anio, mes - 1, dia);
  return null;
};

export default function GestionClientes() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos los estados");
  const [clients, setClients] = useState([]);
  const [verCliente, setVerCliente] = useState(null);
  const [editCliente, setEditCliente] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nuevoForm, setNuevoForm] = useState({
    tipo_documento: "CC",
    numero_documento: "",
    nombre_completo: "",
    telefono: "",
    email: "",
    estado: "Activo",
  });

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("id_cliente", { ascending: true });
    if (error) {
      console.log("Error trayendo clientes:", error);
    } else {
      setClients(data);
    }
  };

  const totalClientes = clients.length;
  const totalActivos = clients.filter((c) => c.estado === "Activo").length;
  const ahora = new Date();
  const estesMes = clients.filter((c) => {
    const f = parseFecha(c.fecha_registro);
    return (
      f &&
      f.getMonth() === ahora.getMonth() &&
      f.getFullYear() === ahora.getFullYear()
    );
  }).length;
  const totalDirecciones = clients.filter(
    (c) => c.email && c.email.trim() !== ""
  ).length;

  const statCards = [
    { label: "Total Clientes", value: totalClientes, sub: "registrados", border: "#B89B6A", color: "#B89B6A", iconBg: "#f5e9cc", Icon: UserRound },
    { label: "Activos", value: totalActivos, sub: "clientes activos", border: "#9ca3af", color: "#374151", iconBg: "#d1d5db", Icon: UserCheck },
    { label: "Este Mes", value: estesMes, sub: "nuevos registros", border: "#ddd0b0", color: "#8a7450", iconBg: "#edddb8", Icon: CalendarDays },
    { label: "Direcciones", value: totalDirecciones, sub: "registradas", border: "#c8cdd3", color: "#1f2937", iconBg: "#d1d5db", Icon: MapPin },
  ];

  const filtered = clients.filter((c) => {
    const nombre = c.nombre_completo || "";
    const doc = c.numero_documento || "";
    const correo = c.email || "";
    const tel = c.telefono || "";
    const matchSearch =
      nombre.toLowerCase().includes(search.toLowerCase()) ||
      doc.includes(search) ||
      correo.toLowerCase().includes(search.toLowerCase()) ||
      tel.includes(search);
    const matchFilter =
      filter === "Todos los estados" || c.estado === filter;
    return matchSearch && matchFilter;
  });

  const deleteClient = async (id) => {
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id_cliente", id);
    if (error) {
      console.log("Error eliminando:", error);
      return;
    }
    await obtenerClientes();
  };

  const toggleEstado = async (id) => {
    const cliente = clients.find((c) => c.id_cliente === id);
    const nuevoEstado = cliente.estado === "Activo" ? "Inactivo" : "Activo";
    const { error } = await supabase
      .from("clientes")
      .update({ estado: nuevoEstado })
      .eq("id_cliente", id);
    if (error) {
      console.log("Error cambiando estado:", error);
      return;
    }
    await obtenerClientes();
  };

  const abrirEditar = (cliente) => {
    setEditCliente(cliente);
    setEditForm({ ...cliente });
    setErrorMsg("");
  };

  const guardarEditar = async () => {
    // Solo enviamos los campos editables, nunca id_cliente
    const { id_cliente, ...camposEditables } = editForm;
    const { error } = await supabase
      .from("clientes")
      .update(camposEditables)
      .eq("id_cliente", editCliente.id_cliente);
    if (error) {
      console.log("Error editando:", error);
      if (error.code === "23505") {
        setErrorMsg("El documento o correo ya está registrado en otro cliente.");
      } else {
        setErrorMsg("Error al guardar. Revisa los datos.");
      }
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
     console.log(datosAEnviar);
    const { data, error } = await supabase
  .from("clientes")
  .insert([datosAEnviar]);

console.log("DATA:", data);
console.log("ERROR COMPLETO:", error);

if (error) {
  alert(error.message);
  return;
}
    if (error) {
      console.log("Error guardando:", error);
      if (error.code === "23505") {
        setErrorMsg("El número de documento o correo ya está registrado.");
      } else {
        setErrorMsg("Error al guardar. Revisa los datos.");
      }
      return;
    }
    await obtenerClientes();
    setMostrarNuevo(false);
    setNuevoForm({
      tipo_documento: "CC",
      numero_documento: "",
      nombre_completo: "",
      telefono: "",
      email: "",
      estado: "Activo",
    });
  };

  const fieldLabel = {
    fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block",
  };
  const fieldValue = {
    fontSize: 14, color: "#111827", padding: "8px 0", borderBottom: "1px solid #f0f0f0",
  };
  const formInput = {
    width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb",
    fontSize: 13, color: "#111827", outline: "none", background: "#fafafa", marginBottom: 12,
  };
  const btnCancelar = {
    background: "#f3f4f6", color: "#374151", border: "1.5px solid #e5e7eb",
    borderRadius: 50, padding: "8px 0", fontSize: 13, fontWeight: 600,
    cursor: "pointer", flex: 1,
  };
  const btnGuardar = (disabled) => ({
    background: disabled ? "#d1b98a" : "#B89B6A",
    color: "#000", border: "none", borderRadius: 50, padding: "8px 0",
    fontSize: 13, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1, flex: 1,
  });

  return (
    <div className="p-5" style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Gestión de Clientes</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Administración de base de datos de clientes
          </p>
        </div>
        <button
          type="button"
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={() => { setMostrarNuevo(true); setErrorMsg(""); }}
        >
          <UserPlus size={15} /> Nuevo Cliente
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="card shadow-sm rounded-4"
            style={{ padding: "18px 20px", border: `1.5px solid ${card.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: card.color, lineHeight: 1.1 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{card.sub}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: card.iconBg, color: card.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <card.Icon size={18} strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Filtros y Búsqueda</h6>
        <div className="d-flex gap-3">
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
              <Search size={14} />
            </span>
            <input
              className="form-control rounded-pill"
              style={{ paddingLeft: 36, fontSize: 13 }}
              placeholder="Buscar por nombre, documento, teléfono o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select rounded-pill"
            style={{ maxWidth: 200, fontSize: 13 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Todos los estados</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#B89B6A" }}>Base de Datos de Clientes</h6>
          <small style={{ color: "#6b7280" }}>{filtered.length} clientes</small>
        </div>
        <table className="table align-middle">
          <thead>
            <tr>
              {["Tipo Doc.", "Número Documento", "Nombre Completo", "Teléfono", "Correo Electrónico", "Fecha Registro", "Estado", "Acciones"].map((h, i) => (
                <th key={i} style={{ fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id_cliente}>
                <td style={{ fontSize: 13 }}>{c.tipo_documento}</td>
                <td style={{ fontSize: 13 }}>{c.numero_documento}</td>
                <td style={{ fontSize: 13, fontWeight: 600 }}>{c.nombre_completo}</td>
                <td style={{ fontSize: 13, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.telefono}>{c.telefono}</td>
                <td style={{ fontSize: 13, color: "#374151", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.email}>{c.email}</td>
                <td style={{ fontSize: 13 }}>{formatFecha(c.fecha_registro)}</td>
                <td>
                  <span
                    title="Clic para cambiar estado"
                    onClick={() => toggleEstado(c.id_cliente)}
                    style={{
                      background: c.estado === "Activo" ? "#B89B6A" : "#374151",
                      color: c.estado === "Activo" ? "#000" : "#fff",
                      borderRadius: 50, padding: "3px 12px", fontSize: 11, fontWeight: 600,
                      display: "inline-flex", alignItems: "center", gap: 5,
                      cursor: "pointer", userSelect: "none",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                    {c.estado ?? "Activo"}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Eye size={18} style={{ cursor: "pointer", color: "#374151" }} title="Ver" onClick={() => setVerCliente(c)} />
                    <Pencil size={18} style={{ cursor: "pointer", color: "#B89B6A" }} title="Editar" onClick={() => abrirEditar(c)} />
                    <Trash2 size={18} style={{ cursor: "pointer", color: "#ef4444" }} title="Eliminar" onClick={() => deleteClient(c.id_cliente)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL VER */}
      {verCliente && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setVerCliente(null)}>
          <div className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }}
            onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setVerCliente(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={18} />
            </button>
            <h5 className="fw-bold mb-1">Detalle del Cliente</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
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
                <span style={{
                  background: verCliente.estado === "Activo" ? "#B89B6A" : "#374151",
                  color: verCliente.estado === "Activo" ? "#000" : "#fff",
                  borderRadius: 50, padding: "3px 12px", fontSize: 11, fontWeight: 600,
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  {verCliente.estado ?? "Activo"}
                </span>
              </div>
            </div>
            <button type="button" onClick={() => setVerCliente(null)}
              className="btn rounded-pill btn-sm w-100"
              style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editCliente && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setEditCliente(null)}>
          <div className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }}
            onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setEditCliente(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={18} />
            </button>
            <h5 className="fw-bold mb-1">Editar Cliente</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <label style={fieldLabel}>Tipo de Documento</label>
            <select style={formInput} value={editForm.tipo_documento}
              onChange={(e) => setEditForm({ ...editForm, tipo_documento: e.target.value })}>
              {TIPOS_DOC.map((t) => <option key={t} value={t}>{TIPO_DOC_LABELS[t]}</option>)}
            </select>
            <label style={fieldLabel}>Número de Documento</label>
            <input style={formInput} value={editForm.numero_documento}
              onChange={(e) => setEditForm({ ...editForm, numero_documento: e.target.value })} />
            <label style={fieldLabel}>Nombre Completo</label>
            <input style={formInput} value={editForm.nombre_completo}
              onChange={(e) => setEditForm({ ...editForm, nombre_completo: e.target.value })} />
            <label style={fieldLabel}>Teléfono</label>
            <input style={formInput} value={editForm.telefono}
              onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />
            <label style={fieldLabel}>Correo Electrónico</label>
            <input style={formInput} value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <label style={fieldLabel}>Estado</label>
            <select style={formInput} value={editForm.estado}
              onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
            {errorMsg && (
              <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10, padding: "6px 10px", background: "#fef2f2", borderRadius: 8 }}>
                {errorMsg}
              </div>
            )}
            <div className="d-flex gap-2 mt-2">
              <button type="button" onClick={() => { setEditCliente(null); setErrorMsg(""); }} style={btnCancelar}>Cancelar</button>
              <button type="button" onClick={guardarEditar} style={btnGuardar(false)}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO */}
      {mostrarNuevo && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setMostrarNuevo(false)}>
          <div className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }}
            onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setMostrarNuevo(false)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={18} />
            </button>
            <h5 className="fw-bold mb-1">Nuevo Cliente</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <label style={fieldLabel}>Tipo de Documento</label>
            <select style={formInput} value={nuevoForm.tipo_documento}
              onChange={(e) => setNuevoForm({ ...nuevoForm, tipo_documento: e.target.value })}>
              {TIPOS_DOC.map((t) => <option key={t} value={t}>{TIPO_DOC_LABELS[t]}</option>)}
            </select>
            <label style={fieldLabel}>Número de Documento</label>
            <input style={formInput} placeholder="Ej: 1234567890" value={nuevoForm.numero_documento}
              onChange={(e) => setNuevoForm({ ...nuevoForm, numero_documento: e.target.value })} />
            <label style={fieldLabel}>Nombre Completo</label>
            <input style={formInput} placeholder="Nombre y apellidos" value={nuevoForm.nombre_completo} 
            onChange={(e) => { console.log(e.target.value); setNuevoForm({...nuevoForm,nombre_completo: e.target.value});}}/>
            <label style={fieldLabel}>Teléfono</label>
            <input style={formInput} placeholder="+57 300 000 0000" value={nuevoForm.telefono}
              onChange={(e) => setNuevoForm({ ...nuevoForm, telefono: e.target.value })} />
            <label style={fieldLabel}>Correo Electrónico</label>
            <input style={formInput} placeholder="correo@email.com" value={nuevoForm.email}
              onChange={(e) => setNuevoForm({ ...nuevoForm, email: e.target.value })} />
            <label style={fieldLabel}>Estado</label>
            <select style={formInput} value={nuevoForm.estado}
              onChange={(e) => setNuevoForm({ ...nuevoForm, estado: e.target.value })}>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
            {errorMsg && (
              <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10, padding: "6px 10px", background: "#fef2f2", borderRadius: 8 }}>
                {errorMsg}
              </div>
            )}
            <div className="d-flex gap-2 mt-2">
              <button type="button" onClick={() => { setMostrarNuevo(false); setErrorMsg(""); }} style={btnCancelar}>Cancelar</button>
              <button
                type="button"
                onClick={guardarNuevo}
                disabled={!nuevoForm.nombre_completo || !nuevoForm.numero_documento}
                style={btnGuardar(!nuevoForm.nombre_completo || !nuevoForm.numero_documento)}
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