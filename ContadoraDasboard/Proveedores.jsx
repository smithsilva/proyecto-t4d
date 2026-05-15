import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building2,
  X,
  Save,
} from "lucide-react";

const PROVEEDORES_INICIALES = [
  {
    id: "SUP-001",
    nombre: "Blindajes Industriales SAS",
    telefono: "+57 (1) 345-6789",
    correo: "ventas@blindajes.com",
    direccion: "Calle 50 #25-30",
    ciudad: "Bogotá",
  },
  {
    id: "SUP-002",
    nombre: "Aceros Especiales Ltda",
    telefono: "+57 (4) 234-5678",
    correo: "contacto@aceros.com",
    direccion: "Carrera 43A #12-15",
    ciudad: "Medellín",
  },
  {
    id: "SUP-003",
    nombre: "Tecnología Balística SA",
    telefono: "+57 (2) 456-7890",
    correo: "info@tecbalistica.com",
    direccion: "Av. 6 #28-40",
    ciudad: "Cali",
  },
];

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
  const [proveedores, setProveedores] = useState(PROVEEDORES_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [verProveedor, setVerProveedor] = useState(null);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    id: "", nombre: "", telefono: "", correo: "", direccion: "", ciudad: "",
  });

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return proveedores;
    return proveedores.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.correo.toLowerCase().includes(q)
    );
  }, [proveedores, busqueda]);

  const guardarProveedor = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      setProveedores((prev) => prev.map((p) => p.id === proveedorEditar.id ? nuevoProveedor : p));
    } else {
      setProveedores([...proveedores, { ...nuevoProveedor, id: `SUP-00${proveedores.length + 1}` }]);
    }
    setMostrarModal(false);
    setModoEdicion(false);
    setProveedorEditar(null);
    setNuevoProveedor({ id: "", nombre: "", telefono: "", correo: "", direccion: "", ciudad: "" });
  };

  const editarProveedor = (proveedor) => {
    setModoEdicion(true);
    setProveedorEditar(proveedor);
    setNuevoProveedor(proveedor);
    setMostrarModal(true);
  };

  const eliminarProveedor = (id) => {
    const confirmar = window.confirm("¿Eliminar proveedor?");
    if (!confirmar) return;
    setProveedores((prev) => prev.filter((p) => p.id !== id));
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
        <table className="table align-middle">
          <thead>
            <tr>
              {["ID", "Nombre", "Teléfono", "Correo", "Dirección", "Ciudad", "Acciones"].map((col) => (
                <th key={col} style={{ fontSize: 12 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{p.id}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Building2 size={16} color="#B89B6A" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.nombre}</span>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, color: "#374151" }}>
                    <Phone size={14} color="#374151" /> {p.telefono}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, color: "#374151" }}>
                    <Mail size={14} color="#374151" /> {p.correo}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, color: "#374151" }}>
                    <MapPin size={14} color="#374151" /> {p.direccion}
                  </div>
                </td>
                <td>
                  <span style={{ background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>
                    {p.ciudad}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Eye size={18} style={{ cursor: "pointer", color: "#374151" }} title="Ver" onClick={() => setVerProveedor(p)} />
                    <Pencil size={18} style={{ cursor: "pointer", color: "#B89B6A" }} title="Editar" onClick={() => editarProveedor(p)} />
                    <Trash2 size={18} style={{ cursor: "pointer", color: "#ef4444" }} title="Eliminar" onClick={() => eliminarProveedor(p.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL VER */}
      {verProveedor && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setVerProveedor(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 400, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVerProveedor(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Detalle del Proveedor</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <p style={{ fontSize: 13 }}><strong>Nombre:</strong> {verProveedor.nombre}</p>
            <p style={{ fontSize: 13 }}><strong>Teléfono:</strong> {verProveedor.telefono}</p>
            <p style={{ fontSize: 13 }}><strong>Correo:</strong> {verProveedor.correo}</p>
            <p style={{ fontSize: 13 }}><strong>Dirección:</strong> {verProveedor.direccion}</p>
            <p style={{ fontSize: 13 }}><strong>Ciudad:</strong> {verProveedor.ciudad}</p>
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
              {[["nombre","Nombre"],["telefono","Teléfono"],["correo","Correo"],["direccion","Dirección"],["ciudad","Ciudad"]].map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    type={key === "correo" ? "email" : "text"}
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