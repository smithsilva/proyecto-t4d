import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../Supabase/SupabaseClient";
import {
  Search, Plus, Eye, Pencil, Trash2,
  Building2, MapPin, Phone, Clock3, X, Save,
} from "lucide-react";


const SUPABASE_ANON_KEY = "sb_publishable_3WU0ecokunMuTQMf6xWqLA_TrZVAZ7X";


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
  const [sucursales, setSucursales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sucursalEditar, setSucursalEditar] = useState(null);
  const [verSucursal, setVerSucursal] = useState(null);
  const [nuevaSucursal, setNuevaSucursal] = useState(VACIO);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarSucursales();
  }, []);

  const cargarSucursales = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from("sucursales")
        .select("*")
        .order("id_sucursal", { ascending: true });
      if (error) throw error;
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

  const activas = sucursales.filter((s) => s.activo === 1 || s.activo === true).length;
  const inactivas = sucursales.filter((s) => s.activo === 0 || s.activo === false).length;

  const abrirAgregar = () => { setModoEdicion(false); setSucursalEditar(null); setNuevaSucursal(VACIO); setMostrarModal(true); };
  const abrirEditar = (s) => { setModoEdicion(true); setSucursalEditar(s); setNuevaSucursal(s); setMostrarModal(true); };
  const cerrar = () => { setMostrarModal(false); setNuevaSucursal(VACIO); };

  const guardarSucursal = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        const { error } = await supabase
          .from("sucursales")
          .update({
            nombre_sucursal: nuevaSucursal.nombre_sucursal,
            direccion: nuevaSucursal.direccion,
            ciudad: nuevaSucursal.ciudad,
            telefono: nuevaSucursal.telefono,
            horario_apertura: nuevaSucursal.horario_apertura,
            horario_cierre: nuevaSucursal.horario_cierre,
            activo: nuevaSucursal.activo,
          })
          .eq("id_sucursal", sucursalEditar.id_sucursal);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sucursales")
          .insert([{
            nombre_sucursal: nuevaSucursal.nombre_sucursal,
            direccion: nuevaSucursal.direccion,
            ciudad: nuevaSucursal.ciudad,
            telefono: nuevaSucursal.telefono,
            horario_apertura: nuevaSucursal.horario_apertura,
            horario_cierre: nuevaSucursal.horario_cierre,
            activo: nuevaSucursal.activo,
          }]);
        if (error) throw error;
      }
      await cargarSucursales();
      cerrar();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const eliminarSucursal = async (id) => {
    if (!window.confirm("¿Eliminar sucursal?")) return;
    try {
      const { error } = await supabase
        .from("sucursales")
        .delete()
        .eq("id_sucursal", id);
      if (error) throw error;
      await cargarSucursales();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const badgeActivo = (activo) => (
    <span style={{
      background: activo ? "#f5efe4" : "#fef2f2",
      color: activo ? "#B89B6A" : "#dc2626",
      padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
    }}>
      {activo ? "Activa" : "Inactiva"}
    </span>
  );

  return (
    <div className="p-5" style={{ background: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Gestión de Sucursales</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Administra todas las sedes de la empresa</p>
        </div>
        <button
          onClick={abrirAgregar}
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Total</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={18} color="#B89B6A" />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#B89B6A" }}>{sucursales.length}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>Sucursales registradas</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Activas</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Eye size={18} color="#B89B6A" />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#374151" }}>{activas}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>Sucursales operativas</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Inactivas</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={18} color="#B89B6A" />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#1f2937" }}>{inactivas}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>Fuera de servicio</div>
          </div>
        </div>
      </div>

      {/* FILTRO */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Filtros y Búsqueda</h6>
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
      <div className="card p-3 rounded-4 shadow-sm">
        {cargando ? (
          <div className="text-center py-4" style={{ color: "#6b7280", fontSize: 13 }}>Cargando sucursales...</div>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                {["ID","Nombre","Dirección","Ciudad","Teléfono","Apertura","Cierre","Estado","Acciones"].map((col) => (
                  <th key={col} style={{ fontSize: 12 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((s) => (
                <tr key={s.id_sucursal}>
                  <td style={{ fontWeight: 700, color: "#6b7280", letterSpacing: "1px", whiteSpace: "nowrap", fontSize: 13 }}>{s.id_sucursal}</td>
                  <td style={{ fontWeight: 700, color: "#111827" }}>
                    <div className="d-flex align-items-center gap-2">
                      <Building2 size={16} color="#B89B6A" /> {s.nombre_sucursal}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2" style={{ color: "#374151", fontSize: "14px" }}>
                      <MapPin size={15} color="#6b7280" /> {s.direccion}
                    </div>
                  </td>
                  <td>
                    <span style={{ background: "#f3f4f6", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#374151" }}>
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
                    <div className="d-flex gap-2">
                      <button onClick={() => setVerSucursal(s)} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Eye size={16} color="#374151" />
                      </button>
                      <button onClick={() => abrirEditar(s)} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e8d5b7", background: "#fdf8f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Pencil size={16} color="#B89B6A" />
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
        )}
      </div>

      {/* MODAL VER */}
      {verSucursal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={() => setVerSucursal(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 420, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVerSucursal(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">Detalle de la Sucursal</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
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
            <button onClick={() => setVerSucursal(null)} className="btn w-100 mt-2" style={{ background: "#B89B6A", color: "#000", fontWeight: 700, border: "none" }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR */}
      {mostrarModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }} onClick={cerrar}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: 440, position: "relative", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={cerrar} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            <h5 className="fw-bold mb-1">{modoEdicion ? "Editar Sucursal" : "Agregar Sucursal"}</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />
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
                <button type="submit" className="btn rounded-pill btn-sm" style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
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