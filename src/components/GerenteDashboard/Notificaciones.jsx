import React, { useState } from "react";
import { Filter, Search, X } from "lucide-react";

// ─── Paleta unificada con Inventario ──────────────────────────────
const DORADO        = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO  = "#e7c98a";
const FONDO         = "#f7f1e3";
const ENCABEZADO    = "#13202e";
const TEXTO_ENC     = "#e7c98a";

const dataInicial = [
  { id: "RN-001", vehiculo: "APC Guardian",   problema: "Falla Motor",        prioridad: "Crítica", estado: "Nueva",    costo: "$15,000", fecha: "4/2/2024" },
  { id: "RN-002", vehiculo: "Tank Scorpion",   problema: "Blindaje Dañado",    prioridad: "Crítica", estado: "Revisada", costo: "$25,000", fecha: "3/2/2024" },
  { id: "RN-003", vehiculo: "Humvee Armored",  problema: "Sistema de Luces",   prioridad: "Media",   estado: "Aprobada", costo: "$3,500",  fecha: "3/1/2024" },
  { id: "RN-004", vehiculo: "APC Titan",       problema: "Comunicaciones",     prioridad: "Alta",    estado: "Nueva",    costo: "$8,000",  fecha: "2/2/2024" },
  { id: "RN-005", vehiculo: "MRAP Defender",   problema: "Sistema Eléctrico",  prioridad: "Baja",    estado: "Revisada", costo: "$2,000",  fecha: "1/2/2024" },
];

// ─── Badge Prioridad — píldora suave con paleta dorada ────────────
const badgePrioridad = (tipo) => {
  const map = {
    Crítica: { bg: "#fbe2df", color: "#c0392b" },
    Alta:    { bg: "#fdf3da", color: "#b8860b" },
    Media:   { bg: "#f0ece4", color: DORADO_OSCURO },
    Baja:    { bg: "#f3f4f6", color: "#6b7280"  },
  };
  const s = map[tipo] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{
      backgroundColor: s.bg,
      color: s.color,
      fontSize: "12px",
      fontWeight: 600,
      padding: "4px 12px",
      borderRadius: "12px",
      display: "inline-block",
    }}>
      {tipo}
    </span>
  );
};

// ─── Badge Estado — misma línea de estilos suaves ─────────────────
const badgeEstado = (estado) => {
  const map = {
    Nueva:    { bg: "#e3f7e9", color: "#1f9d55" },
    Revisada: { bg: "#fdf3da", color: "#b8860b" },
    Aprobada: { bg: "#f0ece4", color: DORADO_OSCURO },
  };
  const s = map[estado] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{
      backgroundColor: s.bg,
      color: s.color,
      fontSize: "12px",
      fontWeight: 600,
      padding: "4px 12px",
      borderRadius: "12px",
      display: "inline-block",
    }}>
      {estado}
    </span>
  );
};

const Notificaciones = () => {
  const [search, setSearch]                   = useState("");
  const [estadoFiltro, setEstadoFiltro]       = useState("");
  const [prioridadFiltro, setPrioridadFiltro] = useState("");
  const [items, setItems]                     = useState(dataInicial);

  const cambiarEstado = (id, nuevoEstado) => {
    setItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, estado: nuevoEstado } : item)
    );
  };

  const filteredData = items.filter((item) => {
    const matchSearch =
      item.vehiculo.toLowerCase().includes(search.toLowerCase()) ||
      item.problema.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchEstado    = estadoFiltro    === "" || item.estado    === estadoFiltro;
    const matchPrioridad = prioridadFiltro === "" || item.prioridad === prioridadFiltro;
    return matchSearch && matchEstado && matchPrioridad;
  });

  const limpiarFiltros = () => {
    setSearch("");
    setEstadoFiltro("");
    setPrioridadFiltro("");
  };

  // ─── Estilo compartido para botón de acción principal ─────────────
  const btnAccion = {
    background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 3px 12px rgba(140,107,63,0.45)",
  };

  const labelFiltro = {
    fontSize: "12px",
    fontWeight: 600,
    color: DORADO_OSCURO,
    marginBottom: "4px",
    display: "block",
  };

  return (
    <div
      className="p-4"
      style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}
    >

      {/* HEADER */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{
          backgroundColor: "#fffdf8",
          border: `1px solid ${DORADO_CLARO}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Notificaciones{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              — Revisa y aprueba solicitudes de reparación
            </span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
      </div>

      {/* CARDS RESUMEN */}
      <div className="row g-3 mb-4">
        {[
          { title: "Nuevas",    number: items.filter(i => i.estado === "Nueva").length,    subtitle: "sin revisar",  dot: "#1f9d55" },
          { title: "Revisadas", number: items.filter(i => i.estado === "Revisada").length, subtitle: "pendientes",   dot: "#b8860b" },
          { title: "Aprobadas", number: items.filter(i => i.estado === "Aprobada").length, subtitle: "autorizadas",  dot: DORADO_OSCURO },
          { title: "Críticas",  number: items.filter(i => i.prioridad === "Crítica").length, subtitle: "urgente",    dot: "#c0392b" },
        ].map((c) => (
          <div className="col-3" key={c.title}>
            <div
              className="card rounded-4 shadow-sm p-3"
              style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span style={{ fontSize: "13px", color: "#6b7280" }}>{c.title}</span>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: c.dot, display: "inline-block" }} />
              </div>
              <h4 className="fw-bold mb-0" style={{ color: "#111827" }}>{c.number}</h4>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{c.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* COSTO TOTAL */}
      <div
        className="card rounded-4 shadow-sm p-3 mb-4 d-flex flex-row justify-content-between align-items-center"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}
      >
        <div>
          <p style={{ fontSize: "13px", color: DORADO_OSCURO, fontWeight: 600, margin: 0 }}>
            Costo Total Estimado
          </p>
          <h4 className="fw-bold mb-0" style={{ color: "#111827" }}>$53,500</h4>
        </div>
        <span style={{ fontSize: "22px", color: DORADO }}>↑</span>
      </div>

      {/* FILTROS */}
      <div
        className="p-4 rounded-4 shadow-sm mb-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}
      >
        {/* Título con icono igual a Inventario */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>
            Filtros y Búsqueda
          </h6>
        </div>

        {/* Buscador con lupa integrada */}
        <div className="mb-3 position-relative">
          <Search
            size={16}
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#999" }}
          />
          <input
            type="text"
            className="form-control rounded-pill"
            style={{ paddingLeft: "36px", paddingTop: "10px", paddingBottom: "10px" }}
            placeholder="Buscar por vehículo, problema o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="d-flex gap-3 flex-wrap align-items-end">
          <div style={{ flex: "1 1 150px" }}>
            <label style={labelFiltro}>Estado</label>
            <select
              className="form-select rounded-pill"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Nueva">Nueva</option>
              <option value="Revisada">Revisada</option>
              <option value="Aprobada">Aprobada</option>
            </select>
          </div>

          <div style={{ flex: "1 1 150px" }}>
            <label style={labelFiltro}>Prioridad</label>
            <select
              className="form-select rounded-pill"
              value={prioridadFiltro}
              onChange={(e) => setPrioridadFiltro(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <button
            className="btn d-flex align-items-center gap-1 fw-semibold"
            style={{
              color: DORADO_OSCURO,
              border: `1px solid ${DORADO_OSCURO}`,
              borderRadius: "20px",
              padding: "8px 16px",
              whiteSpace: "nowrap",
            }}
            onClick={limpiarFiltros}
          >
            <X size={14} />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* RESULTADO */}
      <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "right", marginBottom: "8px" }}>
        Mostrando {filteredData.length} de {items.length}
      </p>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ backgroundColor: "#fffdf8" }}>
            <thead>
              <tr style={{ backgroundColor: ENCABEZADO }}>
                {["ID", "Vehículo", "Problema", "Prioridad", "Estado", "Costo", "Fecha", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className={h === "Acciones" ? "text-center" : ""}
                    style={{
                      backgroundColor: ENCABEZADO,
                      color: TEXTO_ENC,
                      fontSize: "13px",
                      border: "none",
                      padding: "12px 10px",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
                    No se encontraron notificaciones.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                    <td className="fw-bold" style={{ fontSize: "13px", color: DORADO_OSCURO }}>{item.id}</td>
                    <td style={{ fontSize: "13px", fontWeight: 600 }}>{item.vehiculo}</td>
                    <td style={{ fontSize: "13px", color: "#6b7280" }}>{item.problema}</td>
                    <td>{badgePrioridad(item.prioridad)}</td>
                    <td>{badgeEstado(item.estado)}</td>
                    <td className="fw-bold" style={{ fontSize: "13px" }}>{item.costo}</td>
                    <td style={{ fontSize: "13px", color: "#6b7280" }}>{item.fecha}</td>
                    <td>
                      <div className="d-flex gap-2 align-items-center justify-content-center">
                        {/* ✓ Aprobar — gradiente dorado igual a "Agregar Producto" */}
                        <button
                          style={{
                            ...btnAccion,
                            width: "30px",
                            height: "30px",
                            padding: 0,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                          }}
                          title="Aprobar"
                          onClick={() => cambiarEstado(item.id, "Aprobada")}
                        >
                          ✓
                        </button>

                        {/* ✕ Rechazar — outline rojo */}
                        <button
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            border: "1px solid #c0392b",
                            color: "#c0392b",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                          onClick={() => cambiarEstado(item.id, "Revisada")}
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Notificaciones;