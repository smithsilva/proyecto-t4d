import { useState, useMemo, useEffect } from "react";
import {
  Eye, Pencil, Trash2, Plus, CreditCard, CheckCircle, XCircle,
  Banknote, Building2, X, Save, Filter, Search,
} from "lucide-react";
import { supabase } from "../../supabase/supabaseClient";

// =========================================
// PALETA (misma que Inventario)
// =========================================
const DORADO         = "#d4a743";
const DORADO_OSCURO   = "#8c6b3f";
const DORADO_CLARO    = "#e7c98a";
const FONDO            = "#f7f1e3";
const ENCABEZADO       = "#13202e"; // navy
const TEXTO_ENCABEZADO = "#e7c98a";

function TipoIcono({ tipo }) {
  const iconProps = { size: 16, strokeWidth: 1.8 };
  if (tipo === "Efectivo") return <Banknote {...iconProps} />;
  if (tipo === "Tarjeta")  return <CreditCard {...iconProps} />;
  return <Building2 {...iconProps} />;
}

// Determina el tipo según el nombre para mostrarlo en tabla
const inferirTipo = (nombre) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("efectivo"))                     return "Efectivo";
  if (n.includes("tarjeta") || n.includes("débito") || n.includes("debito")) return "Tarjeta";
  return "Transferencia";
};

const INPUT_STYLE = {
  width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, outline: "none",
  boxSizing: "border-box", marginBottom: 10, background: "#fafafa", color: "#111827",
};
const LABEL_STYLE = { fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" };
const FORM_VACIO  = { nombre_metodo: "", tipo: "Efectivo", descripcion: "", permite_online: false, activo: true };

export default function MetodosPago() {
  const [metodos, setMetodos]         = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [busqueda, setBusqueda]       = useState("");
  const [tipoFiltro, setTipoFiltro]   = useState("");
  const [verMetodo, setVerMetodo]     = useState(null);
  const [editarMetodo, setEditarMetodo] = useState(null);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [eliminarId, setEliminarId]   = useState(null);
  const [form, setForm]               = useState(FORM_VACIO);

  // =========================
  // CARGAR
  // =========================
  const cargarMetodos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("metodos_pago")
      .select("*")
      .order("id_metodo_pago", { ascending: true });

    if (error) {
      console.error("Error cargando métodos de pago:", error.message);
    } else {
      setMetodos((data || []).map(m => ({
        ...m,
        tipo:   inferirTipo(m.nombre_metodo),
        estado: m.permite_online !== undefined
          ? (m.permite_online || m.nombre_metodo?.toLowerCase().includes("efectivo") ? "Activo" : "Activo")
          : "Activo",
      })));
    }
    setCargando(false);
  };

  useEffect(() => { cargarMetodos(); }, []);

  // =========================
  // FILTROS
  // =========================
  const metodosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return metodos.filter(
      (m) =>
        (m.nombre_metodo?.toLowerCase().includes(q) ||
         String(m.id_metodo_pago).includes(q)) &&
        (tipoFiltro === "" || m.tipo === tipoFiltro)
    );
  }, [metodos, busqueda, tipoFiltro]);

  const activos   = metodos.length; // todos activos por ahora
  const inactivos = 0;

  // =========================
  // GUARDAR NUEVO
  // =========================
  const guardarNuevo = async () => {
    if (!form.nombre_metodo.trim()) return;
    const { error } = await supabase
      .from("metodos_pago")
      .insert([{
        nombre_metodo:  form.nombre_metodo,
        descripcion:    form.descripcion,
        permite_online: form.permite_online,
      }]);

    if (error) { alert("Error al guardar: " + error.message); return; }
    setMostrarAgregar(false);
    setForm(FORM_VACIO);
    cargarMetodos();
  };

  // =========================
  // GUARDAR EDICIÓN
  // =========================
  const guardarEdicion = async () => {
    const { error } = await supabase
      .from("metodos_pago")
      .update({
        nombre_metodo:  form.nombre_metodo,
        descripcion:    form.descripcion,
        permite_online: form.permite_online,
      })
      .eq("id_metodo_pago", editarMetodo.id_metodo_pago);

    if (error) { alert("Error al actualizar: " + error.message); return; }
    setEditarMetodo(null);
    cargarMetodos();
  };

  // =========================
  // ELIMINAR
  // =========================
  const confirmarEliminar = async () => {
    const { error } = await supabase
      .from("metodos_pago")
      .delete()
      .eq("id_metodo_pago", eliminarId);

    if (error) { alert("Error al eliminar: " + error.message); return; }
    setEliminarId(null);
    cargarMetodos();
  };

  const abrirEditar  = (m) => { setForm({ ...m }); setEditarMetodo(m); };
  const fieldChange  = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // =========================
  // FORM FIELDS
  // =========================
  const FormFields = () => (
    <>
      <label style={LABEL_STYLE}>Nombre</label>
      <input style={INPUT_STYLE} placeholder="Ej: PSE, PayPal..."
        value={form.nombre_metodo} onChange={(e) => fieldChange("nombre_metodo", e.target.value)} />

      <label style={LABEL_STYLE}>Tipo</label>
      <select style={INPUT_STYLE} value={form.tipo} onChange={(e) => fieldChange("tipo", e.target.value)}>
        <option>Efectivo</option>
        <option>Tarjeta</option>
        <option>Transferencia</option>
      </select>

      <label style={LABEL_STYLE}>Descripción</label>
      <input style={INPUT_STYLE} placeholder="Descripción breve..."
        value={form.descripcion || ""} onChange={(e) => fieldChange("descripcion", e.target.value)} />

      <label style={LABEL_STYLE}>Permite pago online</label>
      <select style={INPUT_STYLE} value={form.permite_online ? "true" : "false"}
        onChange={(e) => fieldChange("permite_online", e.target.value === "true")}>
        <option value="true">Sí</option>
        <option value="false">No</option>
      </select>
    </>
  );

  const statCards = [
    { label: "Total Métodos", valor: metodos.length, sublabel: "métodos configurados",          color: DORADO,        border: DORADO,       Icon: CreditCard },
    { label: "Activos",       valor: activos,         sublabel: "disponibles para uso",          color: "#1a1a1a",     border: "#9ca3af",    Icon: CheckCircle },
    { label: "Inactivos",     valor: inactivos,       sublabel: "temporalmente deshabilitados",  color: DORADO_OSCURO, border: DORADO_CLARO, Icon: XCircle },
  ];

  // =========================
  // RENDER
  // =========================
  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* ENCABEZADO */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Métodos de Pago{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              - Gestiona las formas de pago aceptadas por la empresa
            </span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
        <button
          className="btn d-flex align-items-center gap-2 fw-semibold"
          onClick={() => { setForm(FORM_VACIO); setMostrarAgregar(true); }}
          style={{
            background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`,
            color: "#fff",
            borderRadius: "8px",
            padding: "8px 18px 8px 8px",
            border: "none",
            boxShadow: "0 3px 12px rgba(140, 107, 63, 0.55)",
          }}
        >
          <span
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.25)" }}
          >
            <Plus size={14} />
          </span>
          Agregar Método
        </button>
      </div>

      {/* STATS */}
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

      {/* FILTROS */}
      <div className="p-4 rounded-4 shadow-sm mb-4" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Búsqueda y Filtros</h6>
        </div>
        <div className="d-flex gap-3" style={{ flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 250px" }}>
            <Search size={16} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Buscar por nombre o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: "36px", paddingTop: "10px", paddingBottom: "10px" }}
            />
          </div>
          <select className="form-select rounded-pill" style={{ maxWidth: 200 }}
            value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Métodos de Pago Registrados</h6>
          <small style={{ color: "#6b7280" }}>
            {metodosFiltrados.length} método{metodosFiltrados.length !== 1 ? "s" : ""} encontrado{metodosFiltrados.length !== 1 ? "s" : ""}
          </small>
        </div>

        {cargando ? (
          <div className="text-center py-5 text-muted">Cargando métodos de pago...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ backgroundColor: "#fffdf8" }}>
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["ID", "Nombre", "Tipo", "Online", "Descripción", "Acciones"].map((col, i) => (
                    <th key={col} className={i === 0 ? "ps-3" : ""} style={{ backgroundColor: ENCABEZADO, color: TEXTO_ENCABEZADO, fontSize: "13px", border: "none", padding: "12px 8px" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metodosFiltrados.map((m) => (
                  <tr key={m.id_metodo_pago} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                    <td className="ps-3 fw-bold" style={{ fontSize: 13, color: DORADO_OSCURO }}>#{m.id_metodo_pago}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ background: "#f0ece4", borderRadius: 6, padding: "5px 6px", display: "inline-flex", color: DORADO_OSCURO }}>
                          <TipoIcono tipo={m.tipo} />
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{m.nombre_metodo}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: "#f0ece4", color: "#374151", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{m.tipo}</span>
                    </td>
                    <td>
                      <span style={{
                        background: m.permite_online ? "#e3f7e9" : "#fbe2df",
                        color: m.permite_online ? "#1f9d55" : "#c0392b",
                        padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      }}>
                        {m.permite_online ? "Sí" : "No"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{m.descripcion || "—"}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-3">
                        <Eye size={19} style={{ cursor: "pointer", color: "#555" }} onClick={() => setVerMetodo(m)} />
                        <Pencil size={19} style={{ cursor: "pointer", color: DORADO_OSCURO }} onClick={() => abrirEditar(m)} />
                        <Trash2 size={19} style={{ cursor: "pointer", color: "#c0392b" }} onClick={() => setEliminarId(m.id_metodo_pago)} />
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
      {verMetodo && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setVerMetodo(null)}>
          <div className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVerMetodo(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Detalle del Método</h5>
            <div style={{ width: 40, height: 3, background: DORADO, borderRadius: 10, marginBottom: 20 }} />
            <div className="d-flex justify-content-center mb-3">
              <div style={{ background: "#f0ece4", borderRadius: 16, padding: "18px 22px", color: DORADO_OSCURO }}>
                <TipoIcono tipo={verMetodo.tipo} />
              </div>
            </div>
            {[
              ["ID",            `#${verMetodo.id_metodo_pago}`],
              ["Nombre",        verMetodo.nombre_metodo],
              ["Tipo",          verMetodo.tipo],
              ["Descripción",   verMetodo.descripcion || "—"],
              ["Permite online", verMetodo.permite_online ? "Sí" : "No"],
            ].map(([key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>{key}</span>
                <span style={{ color: "#111827", fontWeight: 600 }}>{val}</span>
              </div>
            ))}
            <button onClick={() => setVerMetodo(null)} className="btn btn-secondary w-100 mt-3">Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editarMetodo && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setEditarMetodo(null)}>
          <div className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditarMetodo(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Editar Método</h5>
            <div style={{ width: 40, height: 3, background: DORADO, borderRadius: 10, marginBottom: 20 }} />
            <FormFields />
            <div className="d-flex gap-2">
              <button onClick={() => setEditarMetodo(null)} className="btn btn-secondary flex-fill">Cancelar</button>
              <button onClick={guardarEdicion} className="btn flex-fill fw-semibold"
                style={{ background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Save size={15} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR */}
      {mostrarAgregar && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setMostrarAgregar(false)}>
          <div className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMostrarAgregar(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Agregar Método</h5>
            <div style={{ width: 40, height: 3, background: DORADO, borderRadius: 10, marginBottom: 20 }} />
            <FormFields />
            <div className="d-flex gap-2">
              <button onClick={() => setMostrarAgregar(false)} className="btn btn-secondary flex-fill">Cancelar</button>
              <button onClick={guardarNuevo} className="btn flex-fill fw-semibold"
                style={{ background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={15} /> Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {eliminarId && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setEliminarId(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div style={{ background: "#fbe2df", borderRadius: "50%", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Trash2 size={22} color="#c0392b" />
              </div>
              <h5 className="fw-bold mb-1">¿Eliminar método?</h5>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Esta acción no se puede deshacer.</p>
              <div className="d-flex gap-2">
                <button onClick={() => setEliminarId(null)} className="btn btn-secondary flex-fill">Cancelar</button>
                <button onClick={confirmarEliminar} className="btn flex-fill"
                  style={{ background: "#c0392b", color: "#fff", border: "none", fontWeight: 600 }}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}