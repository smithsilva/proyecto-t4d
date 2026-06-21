import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../Supabase/SupabaseClient";
import { Search, Plus, Eye, Pencil, Trash2, Phone, Mail, MapPin, Building2, X, Save, Filter } from "lucide-react";

// ─── PALETA (igual a Inventario) ─────────────────────────────────────────────
const DORADO        = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO  = "#e7c98a";
const FONDO         = "#f7f1e3";
const ENCABEZADO    = "#13202e";
const TEXTO_ENC     = "#e7c98a";
const BTN_GRAD      = "linear-gradient(135deg, #c9941f, #8c6b3f)";

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

const labelStyle = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 };

const PROVEEDOR_VACIO = {
  id_proveedor: null,
  nit: "",
  nombre_proveedor: "",
  telefono: "",
  email: "",
  direccion: "",
  contacto_proveedor: "",
};

export default function Proveedores() {
  const [proveedores,     setProveedores]     = useState([]);
  const [cargando,        setCargando]        = useState(true);
  const [busqueda,        setBusqueda]        = useState("");
  const [mostrarModal,    setMostrarModal]    = useState(false);
  const [modoEdicion,     setModoEdicion]     = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [verProveedor,    setVerProveedor]    = useState(null);
  const [nuevoProveedor,  setNuevoProveedor]  = useState(PROVEEDOR_VACIO);
  const [error,           setError]           = useState(null);

  const cargarProveedores = async () => {
    setCargando(true);
    setError(null);
    const { data, error } = await supabase
      .from("proveedores")
      .select("*")
      .order("id_proveedor", { ascending: true });

    if (error) setError("Error al cargar proveedores: " + error.message);
    else setProveedores(data || []);
    setCargando(false);
  };

  useEffect(() => { cargarProveedores(); }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return proveedores;
    return proveedores.filter(
      (p) => p.nombre_proveedor?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
    );
  }, [proveedores, busqueda]);

  const guardarProveedor = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      nit: nuevoProveedor.nit,
      nombre_proveedor: nuevoProveedor.nombre_proveedor,
      telefono: nuevoProveedor.telefono,
      email: nuevoProveedor.email,
      direccion: nuevoProveedor.direccion,
      contacto_proveedor: nuevoProveedor.contacto_proveedor,
    };

    if (modoEdicion) {
      const { error } = await supabase.from("proveedores").update(payload).eq("id_proveedor", proveedorEditar.id_proveedor);
      if (error) { setError("Error al editar: " + error.message); return; }
    } else {
      const { error } = await supabase.from("proveedores").insert([payload]);
      if (error) { setError("Error al agregar: " + error.message); return; }
    }
    await cargarProveedores();
    cerrarModal();
  };

  const editarProveedor = (p) => {
    setModoEdicion(true);
    setProveedorEditar(p);
    setNuevoProveedor(p);
    setMostrarModal(true);
  };

  const eliminarProveedor = async (id) => {
    if (!window.confirm("¿Eliminar proveedor?")) return;
    const { error } = await supabase.from("proveedores").delete().eq("id_proveedor", id);
    if (error) setError("Error al eliminar: " + error.message);
    else await cargarProveedores();
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setProveedorEditar(null);
    setNuevoProveedor(PROVEEDOR_VACIO);
  };

  const campos = [
    ["nit", "NIT"],
    ["nombre_proveedor", "Nombre"],
    ["telefono", "Teléfono"],
    ["email", "Correo"],
    ["direccion", "Dirección"],
    ["contacto_proveedor", "Contacto"],
  ];

  return (
    <div className="p-5" style={{ background: FONDO, minHeight: "100vh" }}>

      {/* HEADER */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Gestión de Proveedores{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>- Gestiona los proveedores de la empresa</span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
        <button
          className="btn d-flex align-items-center gap-2 fw-semibold"
          onClick={() => { setModoEdicion(false); setMostrarModal(true); }}
          style={{ background: BTN_GRAD, color: "#fff", borderRadius: "8px", padding: "8px 18px 8px 8px", border: "none", boxShadow: "0 3px 12px rgba(140,107,63,0.55)" }}
        >
          <span className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.25)" }}>
            <Plus size={14} />
          </span>
          Agregar Proveedor
        </button>
      </div>

      {error && <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>{error}</div>}

      {/* FILTROS */}
      <div className="p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
            <Search size={14} />
          </span>
          <input
            type="text"
            className="form-control rounded-pill"
            style={{ paddingLeft: 36, fontSize: 13 }}
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ background: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center p-3">
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Proveedores Registrados</h6>
          <small style={{ color: "#6b7280" }}>{filtrados.length} proveedor{filtrados.length !== 1 ? "es" : ""}</small>
        </div>

        {cargando ? (
          <div className="text-center py-4" style={{ color: "#6b7280", fontSize: 13 }}>Cargando proveedores...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["ID", "NIT", "Nombre", "Teléfono", "Correo", "Dirección", "Contacto", "Acciones"].map((col) => (
                    <th key={col} style={{ fontSize: 13, backgroundColor: ENCABEZADO, color: TEXTO_ENC, border: "none", padding: "12px 8px" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4" style={{ color: "#9ca3af", fontSize: 13 }}>
                      No se encontraron proveedores
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p) => (
                    <tr key={p.id_proveedor} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                      <td style={{ fontSize: 13, color: DORADO_OSCURO, fontWeight: 600 }}>#{p.id_proveedor}</td>
                      <td style={{ fontSize: 13, color: "#6b7280" }}>{p.nit}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Building2 size={16} color={DORADO_OSCURO} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.nombre_proveedor}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, color: "#374151" }}>
                          <Phone size={14} color="#374151" /> {p.telefono}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, color: "#374151" }}>
                          <Mail size={14} color="#374151" /> {p.email}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, color: "#374151" }}>
                          <MapPin size={14} color="#374151" /> {p.direccion}
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: "#374151" }}>{p.contacto_proveedor}</td>
                      <td>
                        <div className="d-flex gap-3">
                          <Eye size={19} style={{ cursor: "pointer", color: "#555" }} title="Ver" onClick={() => setVerProveedor(p)} />
                          <Pencil size={19} style={{ cursor: "pointer", color: DORADO_OSCURO }} title="Editar" onClick={() => editarProveedor(p)} />
                          <Trash2 size={19} style={{ cursor: "pointer", color: "#c0392b" }} title="Eliminar" onClick={() => eliminarProveedor(p.id_proveedor)} />
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

      {/* MODAL VER */}
      {verProveedor && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setVerProveedor(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 400, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVerProveedor(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={18} />
            </button>
            <h5 className="fw-bold mb-1">Detalle del Proveedor</h5>
            <div style={{ width: 40, height: 3, background: BTN_GRAD, borderRadius: 10, marginBottom: 20 }} />
            {[
              ["ID", verProveedor.id_proveedor],
              ["NIT", verProveedor.nit],
              ["Nombre", verProveedor.nombre_proveedor],
              ["Teléfono", verProveedor.telefono],
              ["Correo", verProveedor.email],
              ["Dirección", verProveedor.direccion],
              ["Contacto", verProveedor.contacto_proveedor],
            ].map(([label, val]) => (
              <p key={label} style={{ fontSize: 13, marginBottom: 8 }}><strong>{label}:</strong> {val}</p>
            ))}
            <button onClick={() => setVerProveedor(null)} className="btn w-100 mt-2" style={{ background: BTN_GRAD, color: "#fff", fontWeight: 700, border: "none" }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR */}
      {mostrarModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={cerrarModal}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={cerrarModal} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={18} />
            </button>
            <h5 className="fw-bold mb-1">{modoEdicion ? "Editar Proveedor" : "Agregar Proveedor"}</h5>
            <div style={{ width: 40, height: 3, background: BTN_GRAD, borderRadius: 10, marginBottom: 20 }} />
            <form onSubmit={guardarProveedor}>
              {campos.map(([key, label]) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={key === "email" ? "email" : "text"}
                    placeholder={label}
                    value={nuevoProveedor[key] || ""}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, [key]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button type="button" onClick={cerrarModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn d-flex align-items-center gap-2 fw-semibold"
                  style={{ background: BTN_GRAD, color: "#fff", borderRadius: "8px", border: "none" }}>
                  <Save size={15} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}