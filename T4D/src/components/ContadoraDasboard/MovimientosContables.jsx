import { useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, Download, TrendingUp, TrendingDown, FileText, DollarSign, Calendar, Filter } from "lucide-react";

const DATA = [
  { id: "MOV-001", fecha: "8 de mayo de 2026",  tipo: "Egreso",  concepto: "Compra de placas balísticas nivel IV - 50 unidades", mantenimiento: "MAN-001", valor: 125000000, usuario: "Patricia Ramírez" },
  { id: "MOV-002", fecha: "7 de mayo de 2026",  tipo: "Ingreso", concepto: "Venta de blindaje frontal reforzado",                  mantenimiento: "MAN-002", valor: 85000000,  usuario: "Patricia Ramírez" },
  { id: "MOV-003", fecha: "6 de mayo de 2026",  tipo: "Egreso",  concepto: "Mantenimiento preventivo vehículo VT-001",             mantenimiento: "MAN-003", valor: 15000000,  usuario: "Patricia Ramírez" },
  { id: "MOV-004", fecha: "5 de mayo de 2026",  tipo: "Ajuste",  concepto: "Ajuste contable por diferencia en inventario",         mantenimiento: "MAN-004", valor: 2500000,   usuario: "Patricia Ramírez" },
  { id: "MOV-005", fecha: "4 de mayo de 2026",  tipo: "Egreso",  concepto: "Reparación de blindaje lateral LAV-25",                mantenimiento: "MAN-005", valor: 42000000,  usuario: "Patricia Ramírez" },
];

const fmt = (n) => `$ ${n.toLocaleString("es-CO")}`;

const badgeConfig = {
  Egreso:  { bg: "#1f2937", color: "#fff",  label: "Egreso" },
  Ingreso: { bg: "#B89B6A", color: "#000",  label: "Ingreso" },
  Ajuste:  { bg: "#374151", color: "#fff",  label: "Ajuste" },
};

const amountColor = {
  Egreso:  "#1f2937",
  Ingreso: "#B89B6A",
  Ajuste:  "#374151",
};

export default function MovimientosContables() {
  const [busqueda, setBusqueda] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos los tipos");

  const movimientos = DATA;

  const totalIngresos = movimientos.filter(m => m.tipo === "Ingreso").reduce((a, m) => a + m.valor, 0);
  const totalEgresos  = movimientos.filter(m => m.tipo === "Egreso" ).reduce((a, m) => a + m.valor, 0);
  const totalAjustes  = movimientos.filter(m => m.tipo === "Ajuste" ).reduce((a, m) => a + m.valor, 0);
  const balance       = totalIngresos - totalEgresos;

  const filtrados = movimientos.filter((m) => {
    const matchBusqueda = m.concepto.toLowerCase().includes(busqueda.toLowerCase()) || m.id.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = tipoFiltro === "Todos los tipos" || m.tipo === tipoFiltro;
    return matchBusqueda && matchTipo;
  });

  const statCards = [
    { label: "Total Ingresos", valor: fmt(totalIngresos), sublabel: "Entradas registradas", color: "#B89B6A", border: "#B89B6A", Icon: TrendingUp },
    { label: "Total Egresos", valor: fmt(totalEgresos), sublabel: "Salidas registradas", color: "#1f2937", border: "#9ca3af", Icon: TrendingDown },
    { label: "Ajustes", valor: fmt(totalAjustes), sublabel: "Ajustes contables", color: "#374151", border: "#ddd0b0", Icon: FileText },
    { label: "Balance", valor: balance < 0 ? `-$ ${Math.abs(balance).toLocaleString("es-CO")}` : fmt(balance), sublabel: "Diferencia neta", color: "#B89B6A", border: "#e5e7eb", Icon: DollarSign },
  ];

  return (
    <div className="p-5" style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Gestión de Movimientos Contables</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Administra y controla todos los movimientos financieros del sistema</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn rounded-pill btn-sm" style={{ border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Download size={14} /> Exportar CSV
          </button>
          <button className="btn rounded-pill btn-sm" style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Plus size={14} /> Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="card shadow-sm rounded-4" style={{ padding: "18px 20px", border: `1.5px solid ${card.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <small style={{ color: "#6b7280", fontSize: "13px", fontWeight: "600" }}>{card.label}</small>
              <h3 style={{ fontSize: "20px", fontWeight: "bold", color: card.color, margin: "4px 0", letterSpacing: "-0.5px" }}>{card.valor}</h3>
              <small style={{ color: "#6b7280", fontSize: "12px" }}>{card.sublabel}</small>
            </div>
            <card.Icon size={20} color={card.color} />
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Filtros y Búsqueda</h6>
        <div className="d-flex gap-3" style={{ flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 2 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
              <Search size={14} />
            </span>
            <input
              className="form-control rounded-pill"
              style={{ paddingLeft: 36, fontSize: 13 }}
              type="text"
              placeholder="Buscar por ID, concepto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
              <Calendar size={14} />
            </span>
            <input
              className="form-control rounded-pill"
              style={{ paddingLeft: 36, fontSize: 13, minWidth: 180 }}
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", zIndex: 1 }}>
              <Filter size={14} />
            </span>
            <select
              className="form-select rounded-pill"
              style={{ paddingLeft: 36, fontSize: 13, minWidth: 180 }}
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
            >
              <option>Todos los tipos</option>
              <option>Ingreso</option>
              <option>Egreso</option>
              <option>Ajuste</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#B89B6A" }}>Registro de Movimientos</h6>
          <small style={{ color: "#6b7280" }}>{filtrados.length} movimientos registrados</small>
        </div>
        <table className="table align-middle">
          <thead>
            <tr>
              {["ID Movimiento", "Fecha", "Tipo", "Concepto", "ID Mantenimiento", "Valor", "Usuario Registro", "Acciones"].map((h) => (
                <th key={h} style={{ fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((m) => {
              const badge = badgeConfig[m.tipo] || badgeConfig.Ajuste;
              const color = amountColor[m.tipo] || "#374151";
              return (
                <tr key={m.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <FileText size={14} color="#B89B6A" />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{m.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1" style={{ fontSize: 13, color: "#6b7280" }}>
                      <Calendar size={13} color="#9ca3af" /> {m.fecha}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      background: badge.bg,
                      color: badge.color,
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      display: "inline-block",
                      textTransform: "capitalize",
                    }}>
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: "#374151" }}>{m.concepto}</td>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: 12, background: "#f3f4f6", color: "#6b7280", padding: "3px 8px", borderRadius: 5 }}>{m.mantenimiento}</span>
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600, color, textAlign: "right", whiteSpace: "nowrap" }}>{fmt(m.valor)}</td>
                  <td style={{ fontSize: 13, color: "#374151" }}>{m.usuario}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Eye size={18} style={{ cursor: "pointer", color: "#374151" }} title="Ver" />
                      <Pencil size={18} style={{ cursor: "pointer", color: "#B89B6A" }} title="Editar" />
                      <Trash2 size={18} style={{ cursor: "pointer", color: "#ef4444" }} title="Eliminar" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}