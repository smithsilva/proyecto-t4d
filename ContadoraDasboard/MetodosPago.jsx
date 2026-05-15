import { useState, useMemo } from "react";
import {
  Eye, Pencil, Trash2, Plus, CreditCard, CheckCircle, XCircle,
  Banknote, Building2, X, Save,
} from "lucide-react";

const METODOS_INICIALES = [
  { id: "PAY-001", nombre_metodo: "Efectivo", tipo: "Efectivo", comision: "0%", estado: "Activo", permite_online: false },
  { id: "PAY-002", nombre_metodo: "Tarjeta Crédito/Débito", tipo: "Tarjeta", comision: "2.5%", estado: "Activo", permite_online: true },
  { id: "PAY-003", nombre_metodo: "Transferencia Bancaria", tipo: "Transferencia", comision: "0%", estado: "Activo", permite_online: true },
  { id: "PAY-004", nombre_metodo: "Nequi", tipo: "Transferencia", comision: "1%", estado: "Activo", permite_online: true },
  { id: "PAY-005", nombre_metodo: "Cheque", tipo: "Transferencia", comision: "0%", estado: "Inactivo", permite_online: false },
];

function TipoIcono({ tipo }) {
  const iconProps = { size: 16, strokeWidth: 1.8 };
  if (tipo === "Efectivo") return <Banknote {...iconProps} />;
  if (tipo === "Tarjeta") return <CreditCard {...iconProps} />;
  return <Building2 {...iconProps} />;
}

const INPUT_STYLE = {
  width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, outline: "none",
  boxSizing: "border-box", marginBottom: 10, background: "#fafafa", color: "#111827",
};
const LABEL_STYLE = { fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" };
const FORM_VACIO = { nombre_metodo: "", tipo: "Efectivo", comision: "0%", estado: "Activo", permite_online: false };

export default function MetodosPago() {
  const [metodos, setMetodos] = useState(METODOS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [verMetodo, setVerMetodo] = useState(null);
  const [editarMetodo, setEditarMetodo] = useState(null);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [eliminarId, setEliminarId] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);

  const metodosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return metodos.filter(
      (m) =>
        (m.nombre_metodo.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)) &&
        (tipoFiltro === "" || m.tipo === tipoFiltro)
    );
  }, [metodos, busqueda, tipoFiltro]);

  const activos = metodos.filter((m) => m.estado === "Activo").length;
  const inactivos = metodos.filter((m) => m.estado === "Inactivo").length;

  const abrirEditar = (m) => { setForm({ ...m }); setEditarMetodo(m); };
  const guardarEdicion = () => { setMetodos((prev) => prev.map((m) => (m.id === editarMetodo.id ? { ...m, ...form } : m))); setEditarMetodo(null); };
  const guardarNuevo = () => {
    if (!form.nombre_metodo.trim()) return;
    const nuevoId = "PAY-" + String(metodos.length + 1).padStart(3, "0");
    setMetodos((prev) => [...prev, { ...form, id: nuevoId }]);
    setMostrarAgregar(false);
    setForm(FORM_VACIO);
  };
  const confirmarEliminar = () => { setMetodos((prev) => prev.filter((m) => m.id !== eliminarId)); setEliminarId(null); };
  const fieldChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const FormFields = () => (
    <>
      <label style={LABEL_STYLE}>Nombre</label>
      <input style={INPUT_STYLE} placeholder="Ej: PSE, PayPal..." value={form.nombre_metodo} onChange={(e) => fieldChange("nombre_metodo", e.target.value)} />
      <label style={LABEL_STYLE}>Tipo</label>
      <select style={INPUT_STYLE} value={form.tipo} onChange={(e) => fieldChange("tipo", e.target.value)}>
        <option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option>
      </select>
      <label style={LABEL_STYLE}>Comisión</label>
      <input style={INPUT_STYLE} placeholder="Ej: 0%, 1.5%..." value={form.comision} onChange={(e) => fieldChange("comision", e.target.value)} />
      <label style={LABEL_STYLE}>Estado</label>
      <select style={INPUT_STYLE} value={form.estado} onChange={(e) => fieldChange("estado", e.target.value)}>
        <option>Activo</option><option>Inactivo</option>
      </select>
    </>
  );

  const statCards = [
    { label: "Total Métodos", valor: metodos.length, sublabel: "métodos configurados", color: "#B89B6A", border: "#B89B6A", Icon: CreditCard },
    { label: "Activos", valor: activos, sublabel: "disponibles para uso", color: "#374151", border: "#9ca3af", Icon: CheckCircle },
    { label: "Inactivos", valor: inactivos, sublabel: "temporalmente deshabilitados", color: "#1f2937", border: "#ddd0b0", Icon: XCircle },
  ];

  return (
    <div className="p-5" style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Métodos de Pago</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Gestiona las formas de pago aceptadas por la empresa</p>
        </div>
        <button
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={() => { setForm(FORM_VACIO); setMostrarAgregar(true); }}
        >
          <Plus size={16} /> Agregar Método
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="card shadow-sm rounded-4" style={{ padding: "18px 20px", border: `1.5px solid ${card.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <small style={{ color: card.color, fontSize: "13px", fontWeight: "600" }}>{card.label}</small>
              <h3 style={{ fontSize: "26px", fontWeight: "bold", color: card.color, margin: "4px 0" }}>{card.valor}</h3>
              <small style={{ color: "#6b7280", fontSize: "12px" }}>{card.sublabel}</small>
            </div>
            <card.Icon size={20} color={card.color} />
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Búsqueda y Filtros</h6>
        <div className="d-flex gap-3">
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar por nombre o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className="form-select rounded-pill"
            style={{ maxWidth: 200 }}
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#B89B6A" }}>Métodos de Pago Registrados</h6>
          <small style={{ color: "#6b7280" }}>{metodosFiltrados.length} método{metodosFiltrados.length !== 1 ? "s" : ""} encontrado{metodosFiltrados.length !== 1 ? "s" : ""}</small>
        </div>
        <table className="table align-middle">
          <thead>
            <tr>
              {["ID Método", "Nombre", "Tipo", "Comisión", "Estado", "Acciones"].map((col) => (
                <th key={col} style={{ fontSize: 12 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metodosFiltrados.map((m) => (
              <tr key={m.id}>
                <td style={{ fontSize: 13, color: "#374151" }}>{m.id}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ background: "#f3f4f6", borderRadius: 6, padding: "5px 6px", display: "inline-flex", color: "#374151" }}>
                      <TipoIcono tipo={m.tipo} />
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{m.nombre_metodo}</span>
                  </div>
                </td>
                <td>
                  <span style={{ background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{m.tipo}</span>
                </td>
                <td style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{m.comision}</td>
                <td>
                  <span style={{
                    background: m.estado === "Activo" ? "#B89B6A" : "#374151",
                    color: m.estado === "Activo" ? "#000" : "#fff",
                    padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                    display: "inline-block",
                  }}>
                    {m.estado}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Eye size={18} style={{ cursor: "pointer", color: "#374151" }} title="Ver" onClick={() => setVerMetodo(m)} />
                    <Pencil size={18} style={{ cursor: "pointer", color: "#B89B6A" }} title="Editar" onClick={() => abrirEditar(m)} />
                    <Trash2 size={18} style={{ cursor: "pointer", color: "#ef4444" }} title="Eliminar" onClick={() => setEliminarId(m.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL VER */}
      {verMetodo && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setVerMetodo(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVerMetodo(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Detalle del Método</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <div className="d-flex justify-content-center mb-3">
              <div style={{ background: "#f3f4f6", borderRadius: 16, padding: "18px 22px", color: "#374151" }}>
                <TipoIcono tipo={verMetodo.tipo} />
              </div>
            </div>
            {[["ID", verMetodo.id], ["Nombre", verMetodo.nombre_metodo], ["Tipo", verMetodo.tipo], ["Comisión", verMetodo.comision], ["Permite online", verMetodo.permite_online ? "Sí" : "No"]].map(([key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>{key}</span>
                <span style={{ color: "#111827", fontWeight: 600 }}>{val}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", fontSize: 13 }}>
              <span style={{ color: "#6b7280", fontWeight: 500 }}>Estado</span>
              <span style={{ background: verMetodo.estado === "Activo" ? "#B89B6A" : "#374151", color: verMetodo.estado === "Activo" ? "#000" : "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{verMetodo.estado}</span>
            </div>
            <button onClick={() => setVerMetodo(null)} className="btn btn-secondary w-100 mt-2">Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editarMetodo && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setEditarMetodo(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditarMetodo(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Editar Método</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <FormFields />
            <div className="d-flex gap-2">
              <button onClick={() => setEditarMetodo(null)} className="btn btn-secondary flex-fill">Cancelar</button>
              <button onClick={guardarEdicion} className="btn rounded-pill btn-sm flex-fill" style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Save size={15} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR */}
      {mostrarAgregar && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setMostrarAgregar(false)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMostrarAgregar(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Agregar Método</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
            <FormFields />
            <div className="d-flex gap-2">
              <button onClick={() => setMostrarAgregar(false)} className="btn btn-secondary flex-fill">Cancelar</button>
              <button onClick={guardarNuevo} className="btn rounded-pill btn-sm flex-fill" style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={15} /> Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {eliminarId && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setEliminarId(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div style={{ background: "#fee2e2", borderRadius: "50%", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Trash2 size={22} color="#ef4444" />
              </div>
              <h5 className="fw-bold mb-1">¿Eliminar método?</h5>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Esta acción no se puede deshacer.</p>
              <div className="d-flex gap-2">
                <button onClick={() => setEliminarId(null)} className="btn btn-secondary flex-fill">Cancelar</button>
                <button onClick={confirmarEliminar} className="btn flex-fill" style={{ background: "#ef4444", color: "#fff", border: "none", fontWeight: 600 }}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}