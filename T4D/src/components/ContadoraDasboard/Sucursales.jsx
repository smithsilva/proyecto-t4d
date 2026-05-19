import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Clock3,
} from "lucide-react";

const SUCURSALES_INICIALES = [
  {
    id: "SUC-001",
    nombre: "Sucursal Centro",
    direccion: "Calle 10 #15-30, Centro Histórico",
    ciudad: "Bogotá",
    telefono: "+57 (1) 234-5678",
    horario: "08:00 - 18:00",
    estado: "Activa",
  },
  {
    id: "SUC-002",
    nombre: "Sucursal Norte",
    direccion: "Avenida 15 #120-45, Usaquén",
    ciudad: "Bogotá",
    telefono: "+57 (1) 345-6789",
    horario: "09:00 - 19:00",
    estado: "Activa",
  },
  {
    id: "SUC-003",
    nombre: "Sucursal Medellín",
    direccion: "Carrera 43A #14-20, El Poblado",
    ciudad: "Medellín",
    telefono: "+57 (4) 456-7890",
    horario: "08:30 - 18:30",
    estado: "Activa",
  },
];

export default function Sucursales() {
  const [sucursales, setSucursales] = useState(SUCURSALES_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sucursalEditar, setSucursalEditar] = useState(null);
  const [verSucursal, setVerSucursal] = useState(null);
  const [nuevaSucursal, setNuevaSucursal] = useState({
    id: "",
    nombre: "",
    direccion: "",
    ciudad: "",
    telefono: "",
    horario: "",
    estado: "Activa",
  });

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return sucursales.filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        s.ciudad.toLowerCase().includes(q) ||
        s.direccion.toLowerCase().includes(q)
    );
  }, [sucursales, busqueda]);

  const activas = sucursales.filter((s) => s.estado === "Activa").length;
  const inactivas = sucursales.filter((s) => s.estado === "Inactiva").length;

  const agregarSucursal = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      setSucursales((prev) =>
        prev.map((s) => (s.id === sucursalEditar.id ? nuevaSucursal : s))
      );
    } else {
      setSucursales([
        ...sucursales,
        { ...nuevaSucursal, id: `SUC-00${sucursales.length + 1}` },
      ]);
    }
    setNuevaSucursal({ id: "", nombre: "", direccion: "", ciudad: "", telefono: "", horario: "", estado: "Activa" });
    setModoEdicion(false);
    setSucursalEditar(null);
    setMostrarModal(false);
  };

  const eliminarSucursal = (id) => {
    if (!window.confirm("¿Eliminar sucursal?")) return;
    setSucursales((prev) => prev.filter((s) => s.id !== id));
  };

  const editarSucursal = (sucursal) => {
    setModoEdicion(true);
    setSucursalEditar(sucursal);
    setNuevaSucursal(sucursal);
    setMostrarModal(true);
  };

  const badgeEstado = (estado) => {
    const activo = estado === "Activa";
    return (
      <span
        style={{
          background: activo ? "#f5efe4" : "#fef2f2",
          color: activo ? "#B89B6A" : "#dc2626",
          padding: "5px 14px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {estado}
      </span>
    );
  };

  return (
    <div
      className="p-5"
      style={{ background: "#fff", minHeight: "100vh" }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Gestión de Sucursales</h4>
          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#B89B6A",
              borderRadius: "10px",
              marginBottom: "5px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Administra todas las sedes de la empresa
          </p>
        </div>
        <button
          onClick={() => { setModoEdicion(false); setMostrarModal(true); }}
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}
        >
          <Plus size={16} className="me-1" />
          Agregar
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
        <table className="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Ciudad</th>
              <th>Teléfono</th>
              <th>Horario</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700, color: "#6b7280", letterSpacing: "1px", whiteSpace: "nowrap" }}>{s.id}</td>
                <td style={{ fontWeight: 700, color: "#111827" }}>
                  <div className="d-flex align-items-center gap-2">
                    <Building2 size={16} color="#B89B6A" />
                    {s.nombre}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2" style={{ color: "#374151", fontSize: "14px" }}>
                    <MapPin size={15} color="#6b7280" />
                    {s.direccion}
                  </div>
                </td>
                <td>
                  <span style={{ background: "#f3f4f6", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#374151" }}>
                    {s.ciudad}
                  </span>
                </td>
                <td style={{ color: "#374151", whiteSpace: "nowrap" }}>
                  <div className="d-flex align-items-center gap-2">
                    <Phone size={15} color="#6b7280" />
                    {s.telefono}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2" style={{ color: "#374151" }}>
                    <Clock3 size={15} color="#6b7280" />
                    {s.horario}
                  </div>
                </td>
                <td>{badgeEstado(s.estado)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => setVerSucursal(s)}
                      style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Eye size={16} color="#374151" />
                    </button>
                    <button
                      onClick={() => editarSucursal(s)}
                      style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e8d5b7", background: "#fdf8f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Pencil size={16} color="#B89B6A" />
                    </button>
                    <button
                      onClick={() => eliminarSucursal(s.id)}
                      style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Trash2 size={16} color="#dc2626" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL VER */}
      {verSucursal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }}
        >
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: "400px" }}>
            <h5 className="fw-bold mb-3">Detalle de la Sucursal</h5>
            <p><strong>Nombre:</strong> {verSucursal.nombre}</p>
            <p><strong>Ciudad:</strong> {verSucursal.ciudad}</p>
            <p><strong>Dirección:</strong> {verSucursal.direccion}</p>
            <p><strong>Teléfono:</strong> {verSucursal.telefono}</p>
            <p><strong>Horario:</strong> {verSucursal.horario}</p>
            <button
              onClick={() => setVerSucursal(null)}
              className="btn w-100 mt-2"
              style={{ background: "#B89B6A", color: "#000", fontWeight: 700, border: "none" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR */}
      {mostrarModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }}
        >
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: "420px" }}>
            <h5 className="fw-bold mb-3">{modoEdicion ? "Editar Sucursal" : "Agregar Sucursal"}</h5>
            <form onSubmit={agregarSucursal}>
              {[["nombre","Nombre"],["direccion","Dirección"],["ciudad","Ciudad"],["telefono","Teléfono"],["horario","Horario"]].map(([key, label]) => (
                <input
                  key={key}
                  type="text"
                  className="form-control mb-2"
                  placeholder={label}
                  value={nuevaSucursal[key]}
                  onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, [key]: e.target.value })}
                />
              ))}
              <select
                className="form-select mb-3"
                value={nuevaSucursal.estado}
                onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, estado: e.target.value })}
              >
                <option>Activa</option>
                <option>Inactiva</option>
              </select>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => setMostrarModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn" style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}