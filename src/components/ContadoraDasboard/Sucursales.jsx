import { useState, useMemo, useEffect } from "react";
import {
  obtenerSucursalesApi,
  agregarSucursalApi,
  actualizarSucursalApi,
  eliminarSucursalApi,
} from "../../api/sucursalesApi";
import { Search, Plus, Eye, Pencil, Trash2, Building2, MapPin, Phone, Clock3, X, Save, Filter } from "lucide-react";

// ─── PALETA (igual a Inventario) ─────────────────────────────────────────────
const DORADO        = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO  = "#e7c98a";
const FONDO         = "#f7f1e3";
const ENCABEZADO    = "#13202e";
const TEXTO_ENC     = "#e7c98a";
const BTN_GRAD      = "linear-gradient(135deg, #c9941f, #8c6b3f)";

const VACIO = {
  nombre_sucursal: "", direccion: "", ciudad: "",
  telefono: "", horario_apertura: "", horario_cierre: "", activo: 1,
};

const inputStyle = {
  width: "100%", padding: "9px 12px", marginBottom: 12, borderRadius: 8,
  border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none",
  boxSizing: "border-box", background: "#fafafa", color: "#111827",
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 };

export default function Sucursales() {
  const [sucursales,     setSucursales]     = useState([]);
  const [busqueda,       setBusqueda]       = useState("");
  const [mostrarModal,   setMostrarModal]   = useState(false);
  const [modoEdicion,    setModoEdicion]    = useState(false);
  const [sucursalEditar, setSucursalEditar] = useState(null);
  const [verSucursal,    setVerSucursal]    = useState(null);
  const [nuevaSucursal,  setNuevaSucursal]  = useState(VACIO);
  const [cargando,       setCargando]       = useState(true);

  useEffect(() => { cargarSucursales(); }, []);

  const cargarSucursales = async () => {
    setCargando(true);
    try {
      const data = await obtenerSucursalesApi();
      setSucursales(data || []);
    } catch (err) {
      console.error("Error al cargar sucursales:", err.message);
    }
    setCargando(false);
  };

  const set = (key, val) => setNuevaSucursal((prev) => ({ ...prev, [key]: val }));

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return sucursales.filter(
      (s) =>
        s.nombre_sucursal?.toLowerCase().includes(q) ||
        s.ciudad?.toLowerCase().includes(q) ||
        s.direccion?.toLowerCase().includes(q)
    );
  }, [sucursales, busqueda]);

  const activas   = sucursales.filter((s) => s.activo === 1 || s.activo === true).length;
  const inactivas = sucursales.filter((s) => s.activo === 0 || s.activo === false).length;

  const abrirAgregar = () => { setModoEdicion(false); setSucursalEditar(null); setNuevaSucursal(VACIO); setMostrarModal(true); };
  const abrirEditar  = (s) => { setModoEdicion(true); setSucursalEditar(s); setNuevaSucursal(s); setMostrarModal(true); };
  const cerrar       = () => { setMostrarModal(false); setNuevaSucursal(VACIO); };

  const guardarSucursal = async (e) => {
    e.preventDefault();
    try {
      const sucursal = {
        nombre_sucursal: nuevaSucursal.nombre_sucursal,
        direccion: nuevaSucursal.direccion,
        ciudad: nuevaSucursal.ciudad,
        telefono: nuevaSucursal.telefono,
        horario_apertura: nuevaSucursal.horario_apertura,
        horario_cierre: nuevaSucursal.horario_cierre,
        activo: nuevaSucursal.activo,
      };
      if (modoEdicion) await actualizarSucursalApi(sucursalEditar.id_sucursal, sucursal);
      else await agregarSucursalApi(sucursal);
      await cargarSucursales();
      cerrar();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const eliminarSucursal = async (id) => {
    if (!window.confirm("¿Eliminar sucursal?")) return;
    try {
      await eliminarSucursalApi(id);
      await cargarSucursales();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const badgeActivo = (activo) => (
    <span style={{
      background: activo ? "#f5efe4" : "#fef2f2",
      color: activo ? DORADO_OSCURO : "#dc2626",
      padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
    }}>
      {activo ? "Activa" : "Inactiva"}
    </span>
  );

  const statCards = [
    { label: "Total",     valor: sucursales.length, sublabel: "Sucursales registradas", Icon: Building2 },
    { label: "Activas",   valor: activas,            sublabel: "Sucursales operativas",  Icon: Eye       },
    { label: "Inactivas", valor: inactivas,          sublabel: "Fuera de servicio",      Icon: Trash2    },
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
            Gestión de Sucursales{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>- Administra todas las sedes de la empresa</span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
        <button
          onClick={abrirAgregar}
          className="btn d-flex align-items-center gap-2 fw-semibold"
          style={{ background: BTN_GRAD, color: "#fff", borderRadius: "8px", padding: "8px 18px 8px 8px", border: "none", boxShadow: "0 3px 12px rgba(140,107,63,0.55)" }}
        >
          <span className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.25)" }}>
            <Plus size={14} />
          </span>
          Agregar
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="rounded-4 shadow-sm"
            style={{ padding: "18px 20px", border: `1.5px solid ${DORADO_CLARO}`, background: "#fffdf8", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <small style={{ color: "#6b7280", fontSize: "13px", fontWeight: "600" }}>{card.label}</small>
              <h3 style={{ fontSize: "26px", fontWeight: "bold", color: DORADO_OSCURO, margin: "4px 0" }}>{card.valor}</h3>
              <small style={{ color: "#9ca3af", fontSize: "12px" }}>{card.sublabel}</small>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f0e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <card.Icon size={18} color={DORADO_OSCURO} />
            </div>
          </div>
        ))}
      </div>

      {/* FILTRO */}
      <div className="p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>
        <div style={{ position: "relative" }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar sucursal..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: "38px" }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ background: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center p-3">
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Sucursales Registradas</h6>
          <small style={{ color: "#6b7280" }}>{filtradas.length} sucursal{filtradas.length !== 1 ? "es" : ""}</small>
        </div>

        {cargando ? (
          <div className="text-center py-4" style={{ color: "#6b7280", fontSize: 13 }}>Cargando sucursales...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["ID","Nombre","Dirección","Ciudad","Teléfono","Apertura","Cierre","Estado","Acciones"].map((col) => (
                    <th key={col} style={{ fontSize: 13, backgroundColor: ENCABEZADO, color: TEXTO_ENC, border: "none", padding: "12px 8px" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4" style={{ color: "#9ca3af", fontSize: 13 }}>No se encontraron sucursales</td>
                  </tr>
                ) : filtradas.map((s) => (
                  <tr key={s.id_sucursal} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                    <td style={{ fontWeight: 700, color: DORADO_OSCURO, fontSize: 13 }}>#{s.id_sucursal}</td>
                    <td style={{ fontWeight: 700, color: "#111827" }}>
                      <div className="d-flex align-items-center gap-2">
                        <Building2 size={16} color={DORADO_OSCURO} /> {s.nombre_sucursal}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2" style={{ color: "#374151", fontSize: 13 }}>
                        <MapPin size={15} color="#6b7280" /> {s.direccion}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: "#f3f0e8", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: DORADO_OSCURO }}>
                        {s.ciudad}
                      </span>
                    </td>
                    <td style={{ color: "#374151", whiteSpace: "nowrap" }}>
                      <div className="d-flex align-items-center gap-2">
                        <Phone size={15} color="#6b7280" /> {s.telefono}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2" style={{ color: "#374151" }}>
                        <Clock3 size={15} color="#6b7280" /> {s.horario_apertura}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2" style={{ color: "#374151" }}>
                        <Clock3 size={15} color="#6b7280" /> {s.horario_cierre}
                      </div>
                    </td>
                    <td>{badgeActivo(s.activo)}</td>
                    <td>
                      <div className="d-flex gap-3">
                        <button onClick={() => setVerSucursal(s)} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${DORADO_CLARO}`, background: "#fffdf8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Eye size={16} color="#374151" />
                        </button>
                        <button onClick={() => abrirEditar(s)} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${DORADO_CLARO}`, background: "#f7f1e3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Pencil size={16} color={DORADO_OSCURO} />
                        </button>
                        <button onClick={() => eliminarSucursal(s.id_sucursal)} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Trash2 size={16} color="#dc2626" />
                        </button>
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
      {verSucursal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setVerSucursal(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVerSucursal(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Detalle de la Sucursal</h5>
            <div style={{ width: 40, height: 3, background: BTN_GRAD, borderRadius: 10, marginBottom: 20 }} />
            {[
              ["Nombre", verSucursal.nombre_sucursal],
              ["Dirección", verSucursal.direccion],
              ["Ciudad", verSucursal.ciudad],
              ["Teléfono", verSucursal.telefono],
              ["Horario Apertura", verSucursal.horario_apertura],
              ["Horario Cierre", verSucursal.horario_cierre],
              ["Estado", verSucursal.activo ? "Activa" : "Inactiva"],
            ].map(([label, valor]) => (
              <p key={label} style={{ fontSize: 13, marginBottom: 8 }}><strong>{label}:</strong> {valor}</p>
            ))}
            <button onClick={() => setVerSucursal(null)} className="btn w-100 mt-2" style={{ background: BTN_GRAD, color: "#fff", fontWeight: 700, border: "none" }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR */}
      {mostrarModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={cerrar}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 440, position: "relative", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={cerrar} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">{modoEdicion ? "Editar Sucursal" : "Agregar Sucursal"}</h5>
            <div style={{ width: 40, height: 3, background: BTN_GRAD, borderRadius: 10, marginBottom: 20 }} />
            <form onSubmit={guardarSucursal}>
              <label style={labelStyle}>Nombre de la Sucursal</label>
              <input type="text" style={inputStyle} placeholder="Nombre" value={nuevaSucursal.nombre_sucursal} onChange={(e) => set("nombre_sucursal", e.target.value)} required />

              <label style={labelStyle}>Dirección</label>
              <input type="text" style={inputStyle} placeholder="Dirección" value={nuevaSucursal.direccion} onChange={(e) => set("direccion", e.target.value)} required />

              <label style={labelStyle}>Ciudad</label>
              <input type="text" style={inputStyle} placeholder="Ciudad" value={nuevaSucursal.ciudad} onChange={(e) => set("ciudad", e.target.value)} required />

              <label style={labelStyle}>Teléfono</label>
              <input type="text" style={inputStyle} placeholder="Teléfono" value={nuevaSucursal.telefono} onChange={(e) => set("telefono", e.target.value)} required />

              <label style={labelStyle}>Horario Apertura</label>
              <input type="time" style={inputStyle} value={nuevaSucursal.horario_apertura} onChange={(e) => set("horario_apertura", e.target.value)} required />

              <label style={labelStyle}>Horario Cierre</label>
              <input type="time" style={inputStyle} value={nuevaSucursal.horario_cierre} onChange={(e) => set("horario_cierre", e.target.value)} required />

              <label style={labelStyle}>Estado</label>
              <select style={inputStyle} value={nuevaSucursal.activo} onChange={(e) => set("activo", Number(e.target.value))}>
                <option value={1}>Activa</option>
                <option value={0}>Inactiva</option>
              </select>

              <div className="d-flex justify-content-end gap-2 mt-2">
                <button type="button" onClick={cerrar} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn d-flex align-items-center gap-2 fw-semibold"
                  style={{ background: BTN_GRAD, color: "#fff", borderRadius: "8px", border: "none" }}>
                  <Save size={15} /> {modoEdicion ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}