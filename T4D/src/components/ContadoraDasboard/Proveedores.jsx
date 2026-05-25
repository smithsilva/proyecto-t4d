import { useState, useMemo, useEffect } from "react";
import {
  obtenerProveedores,
  crearProveedor,
  editarProveedor,
  eliminarProveedor,
} from "../api/proveedoresApi";
import {
  Search, Plus, Eye, Pencil, Trash2, Phone, Mail,
  MapPin, Building2, X, Save, Hash, User,
} from "lucide-react";



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

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [verProveedor, setVerProveedor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nit: "", nombre_proveedor: "", contacto_proveedor: "", telefono: "", email: "", direccion: "",
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setCargando(true);
    try {
      const data = await obtenerProveedores();

      setProveedores(data);
    } catch (err) {
      console.error("Error al cargar:", err.message);
    }
    setCargando(false);
  };

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return proveedores;
    return proveedores.filter(
      (p) =>
        p.nombre_proveedor?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
    );
  }, [proveedores, busqueda]);

  const guardarProveedor = async (e) => {
    e.preventDefault();
   try {

  if (modoEdicion) {

    await editarProveedor(
      proveedorEditar.id_proveedor,
      nuevoProveedor
    );

  } else {

    await crearProveedor(nuevoProveedor);

  }

  await cargarProveedores();

  setMostrarModal(false);

  setModoEdicion(false);

  setProveedorEditar(null);

  setNuevoProveedor({
    nit: "",
    nombre_proveedor: "",
    contacto_proveedor: "",
    telefono: "",
    email: "",
    direccion: "",
  });

} catch (err) {

  alert("Error al guardar");

  console.log(err);

}
  };

 const abrirEditarProveedor = (proveedor) => {
    setModoEdicion(true);
    setProveedorEditar(proveedor);
    setNuevoProveedor(proveedor);
    setMostrarModal(true);
  };

 const eliminarProveedorHandler = async (id) => {

  const confirmar = window.confirm(
    "¿Eliminar proveedor?"
  );

  if (!confirmar) return;

  try {

    await eliminarProveedor(id);

    await cargarProveedores();

  } catch (err) {

    alert("Error al eliminar");

    console.log(err);

  }

};

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
                {["ID", "NIT", "Nombre", "Contacto", "Teléfono", "Email", "Dirección", "Acciones"].map((col) => (
                  <th key={col} style={{ fontSize: 12 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id_proveedor}>
                  <td style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{p.id_proveedor}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, color: "#374151" }}>
                      <Hash size={14} color="#374151" /> {p.nit}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Building2 size={16} color="#B89B6A" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.nombre_proveedor}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, color: "#374151" }}>
                      <User size={14} color="#374151" /> {p.contacto_proveedor}
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
                  <td>
                    <div className="d-flex gap-2">
                      <Eye size={18} style={{ cursor: "pointer", color: "#374151" }} title="Ver" onClick={() => setVerProveedor(p)} />
                      <Pencil size={18} style={{ cursor: "pointer", color: "#B89B6A" }} title="Editar" onClick={() => abrirEditarProveedor(p)} />
                      <Trash2 size={18} style={{ cursor: "pointer", color: "#ef4444" }} title="Eliminar" onClick={() => eliminarProveedorHandler(p.id_proveedor)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL VER */}
      {verProveedor && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setVerProveedor(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 400, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVerProveedor(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Detalle del Proveedor</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <p style={{ fontSize: 13 }}><strong>NIT:</strong> {verProveedor.nit}</p>
            <p style={{ fontSize: 13 }}><strong>Nombre:</strong> {verProveedor.nombre_proveedor}</p>
            <p style={{ fontSize: 13 }}><strong>Contacto:</strong> {verProveedor.contacto_proveedor}</p>
            <p style={{ fontSize: 13 }}><strong>Teléfono:</strong> {verProveedor.telefono}</p>
            <p style={{ fontSize: 13 }}><strong>Email:</strong> {verProveedor.email}</p>
            <p style={{ fontSize: 13 }}><strong>Dirección:</strong> {verProveedor.direccion}</p>
            <button onClick={() => setVerProveedor(null)} className="btn btn-secondary w-100 mt-2">Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR */}
      {mostrarModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setMostrarModal(false)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMostrarModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">{modoEdicion ? "Editar Proveedor" : "Agregar Proveedor"}</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <form onSubmit={guardarProveedor}>
              {[
                ["nit", "NIT"],
                ["nombre_proveedor", "Nombre"],
                ["contacto_proveedor", "Contacto"],
                ["telefono", "Teléfono"],
                ["email", "Email"],
                ["direccion", "Dirección"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    type={key === "email" ? "email" : "text"}
                    placeholder={label}
                    value={nuevoProveedor[key]}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, [key]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button type="button" onClick={() => setMostrarModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn rounded-pill btn-sm" style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
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