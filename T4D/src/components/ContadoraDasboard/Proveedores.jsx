import { useState, useMemo, useEffect } from "react";
import {
  obtenerProveedores,
  crearProveedor,
  editarProveedorApi,
  eliminarProveedorApi,
} from "../../api/proveedoresApi";

import { supabase } from "../../Supabase/SupabaseClient";
import { Search, Plus, Eye, Pencil, Trash2, Phone, Mail, MapPin, Building2, X, Save, } from "lucide-react";

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
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [verProveedor, setVerProveedor] = useState(null);
  const [nuevoProveedor, setNuevoProveedor] = useState(PROVEEDOR_VACIO);
  const [error, setError] = useState(null);

  // ── Cargar proveedores desde Supabase ──────────────────────────────────
  const cargarProveedores = async () => {
    setCargando(true);
    setError(null);
    const { data, error } = await supabase
      .from("proveedores")
      .select("*")
      .order("id_proveedor", { ascending: true });

    if (error) {
      setError("Error al cargar proveedores: " + error.message);
    } else {
      setProveedores(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  // ── Filtrado local ─────────────────────────────────────────────────────
  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return proveedores;
    return proveedores.filter(
      (p) =>
        p.nombre_proveedor?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
    );
  }, [proveedores, busqueda]);

  // ── Guardar (crear o editar) ───────────────────────────────────────────
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
      const { error } = await supabase
        .from("proveedores")
        .update(payload)
        .eq("id_proveedor", proveedorEditar.id_proveedor);

      if (error) {
        setError("Error al editar: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("proveedores").insert([payload]);
      if (error) {
        setError("Error al agregar: " + error.message);
        return;
      }
    }

    await cargarProveedores();
    cerrarModal();
  };

  // ── Editar ─────────────────────────────────────────────────────────────
  const editarProveedor = (proveedor) => {
    setModoEdicion(true);
    setProveedorEditar(proveedor);
    setNuevoProveedor(proveedor);
    setMostrarModal(true);
  };

  // ── Eliminar ───────────────────────────────────────────────────────────
  const eliminarProveedor = async (id) => {
    const confirmar = window.confirm("¿Eliminar proveedor?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("proveedores")
      .delete()
      .eq("id_proveedor", id);

    if (error) {
      setError("Error al eliminar: " + error.message);
    } else {
      await cargarProveedores();
    }
  };

  // ── Cerrar modal ───────────────────────────────────────────────────────
  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setProveedorEditar(null);
    setNuevoProveedor(PROVEEDOR_VACIO);
  };

  // ── Campos del formulario ──────────────────────────────────────────────
  const campos = [
    ["nit", "NIT"],
    ["nombre_proveedor", "Nombre"],
    ["telefono", "Teléfono"],
    ["email", "Correo"],
    ["direccion", "Dirección"],
    ["contacto_proveedor", "Contacto"],
  ];

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-5" style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Gestión de Proveedores</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Gestiona los proveedores de la empresa</p>
        </div>
        <button
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={() => { setModoEdicion(false); setMostrarModal(true); }}
        >
          <Plus size={16} /> Agregar Proveedor
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Filtros y Búsqueda</h6>
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
      <div className="card p-3 rounded-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#B89B6A" }}>Proveedores Registrados</h6>
          <small style={{ color: "#6b7280" }}>{filtrados.length} proveedor{filtrados.length !== 1 ? "es" : ""}</small>
        </div>

        {cargando ? (
          <div className="text-center py-4" style={{ color: "#6b7280", fontSize: 13 }}>Cargando proveedores...</div>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                {["ID", "NIT", "Nombre", "Teléfono", "Correo", "Dirección", "Contacto", "Acciones"].map((col) => (
                  <th key={col} style={{ fontSize: 12 }}>{col}</th>
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
                  <tr key={p.id_proveedor}>
                    <td style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{p.id_proveedor}</td>
                    <td style={{ fontSize: 13, color: "#6b7280" }}>{p.nit}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Building2 size={16} color="#B89B6A" />
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
                      <div className="d-flex gap-2">
                        <Eye size={18} style={{ cursor: "pointer", color: "#374151" }} title="Ver" onClick={() => setVerProveedor(p)} />
                        <Pencil size={18} style={{ cursor: "pointer", color: "#B89B6A" }} title="Editar" onClick={() => editarProveedor(p)} />
                        <Trash2 size={18} style={{ cursor: "pointer", color: "#ef4444" }} title="Eliminar" onClick={() => eliminarProveedor(p.id_proveedor)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL VER */}
      {verProveedor && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }}
          onClick={() => setVerProveedor(null)}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: 400, position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVerProveedor(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X size={18} />
            </button>
            <h5 className="fw-bold mb-1">Detalle del Proveedor</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <p style={{ fontSize: 13 }}><strong>ID:</strong> {verProveedor.id_proveedor}</p>
            <p style={{ fontSize: 13 }}><strong>NIT:</strong> {verProveedor.nit}</p>
            <p style={{ fontSize: 13 }}><strong>Nombre:</strong> {verProveedor.nombre_proveedor}</p>
            <p style={{ fontSize: 13 }}><strong>Teléfono:</strong> {verProveedor.telefono}</p>
            <p style={{ fontSize: 13 }}><strong>Correo:</strong> {verProveedor.email}</p>
            <p style={{ fontSize: 13 }}><strong>Dirección:</strong> {verProveedor.direccion}</p>
            <p style={{ fontSize: 13 }}><strong>Contacto:</strong> {verProveedor.contacto_proveedor}</p>
            <button onClick={() => setVerProveedor(null)} className="btn btn-secondary w-100 mt-2">Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR */}
      {mostrarModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }}
          onClick={cerrarModal}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cerrarModal}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X size={18} />
            </button>
            <h5 className="fw-bold mb-1">{modoEdicion ? "Editar Proveedor" : "Agregar Proveedor"}</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <form onSubmit={guardarProveedor}>
              {campos.map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
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
                <button
                  type="submit"
                  className="btn rounded-pill btn-sm"
                  style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
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