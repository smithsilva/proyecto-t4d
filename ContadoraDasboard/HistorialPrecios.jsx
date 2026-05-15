import { useState, useMemo } from "react";

const HISTORIAL_INICIAL = [
  {
    id: "HIST-081",
    producto: "Placa Balística Nivel IV",
    prod_id: "PROD-081",
    precio_anterior: 2500000,
    precio_nuevo: 2750000,
    variacion: 10.0,
    fecha_cambio: "2026-05-08",
    motivo: "Ajuste por inflación y aumento en costo de mate",
    usuario: "Patricia Ramírez",
  },
  {
    id: "HIST-082",
    producto: "Blindaje Frontal Reforzado",
    prod_id: "PROD-082",
    precio_anterior: 3200000,
    precio_nuevo: 2900000,
    variacion: -9.38,
    fecha_cambio: "2026-05-07",
    motivo: "Promoción especial para clientes corporativos",
    usuario: "Patricia Ramírez",
  },
  {
    id: "HIST-083",
    producto: "Sistema de Blindaje Lateral",
    prod_id: "PROD-083",
    precio_anterior: 4500000,
    precio_nuevo: 4500000,
    variacion: 0,
    fecha_cambio: "2026-05-06",
    motivo: "Corrección de precio por error en el sistema",
    usuario: "Patricia Ramírez",
  },
  {
    id: "HIST-084",
    producto: "Vidrio Antibalas",
    prod_id: "PROD-084",
    precio_anterior: 1800000,
    precio_nuevo: 2100000,
    variacion: 16.67,
    fecha_cambio: "2026-05-05",
    motivo: "Incremento por nueva tecnología mejorada",
    usuario: "Patricia Ramírez",
  },
  {
    id: "HIST-085",
    producto: "Placa Balística Nivel IV",
    prod_id: "PROD-085",
    precio_anterior: 2400000,
    precio_nuevo: 2500000,
    variacion: 4.17,
    fecha_cambio: "2026-05-03",
    motivo: "Ajuste trimestral de precios",
    usuario: "Patricia Ramírez",
  },
  {
    id: "HIST-086",
    producto: "Kit de Blindaje Completo",
    prod_id: "PROD-086",
    precio_anterior: 15000000,
    precio_nuevo: 13500000,
    variacion: -10.0,
    fecha_cambio: "2026-05-01",
    motivo: "Descuento por volumen en temporada baja",
    usuario: "Patricia Ramírez",
  },
];

const fmt = (n) =>
  "$ " + n.toLocaleString("es-CO", { minimumFractionDigits: 0 });

function calcDiff(anterior, nuevo) {
  const diff = nuevo - anterior;
  if (diff === 0) return null;
  const sign = diff > 0 ? "+" : "-";
  return `${sign}$ ${Math.abs(diff).toLocaleString("es-CO")}`;
}

function VariacionCell({ item }) {
  const { variacion, precio_anterior, precio_nuevo } = item;
  const diff = calcDiff(precio_anterior, precio_nuevo);

  if (variacion > 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-block" }}>
          ↑ +{variacion.toFixed(2)}%
        </span>
        {diff && <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 500 }}>{diff}</span>}
      </div>
    );
  }
  if (variacion < 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-block" }}>
          ↓ {variacion.toFixed(2)}%
        </span>
        {diff && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>{diff}</span>}
      </div>
    );
  }
  return (
    <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 500, display: "inline-block" }}>
      = Sin cambio
    </span>
  );
}

function formatFecha(iso) {
  const [y, m, d] = iso.split("-");
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

export default function HistorialPrecios() {
  const [historial] = useState(HISTORIAL_INICIAL);
  const [busqueda, setBusqueda] = useState("");
  const [fecha, setFecha] = useState("");
  const [productoFiltro, setProductoFiltro] = useState("");

  const filtrado = useMemo(() => {
    const q = busqueda.toLowerCase();
    return historial.filter((h) => {
      const matchQ = !q || h.id.toLowerCase().includes(q) || h.producto.toLowerCase().includes(q) || h.motivo.toLowerCase().includes(q);
      const matchFecha = !fecha || h.fecha_cambio === fecha;
      const matchProd = !productoFiltro || h.producto === productoFiltro;
      return matchQ && matchFecha && matchProd;
    });
  }, [historial, busqueda, fecha, productoFiltro]);

  const aumentos = historial.filter((h) => h.variacion > 0).length;
  const reducciones = historial.filter((h) => h.variacion < 0).length;
  const sinCambio = historial.filter((h) => h.variacion === 0).length;

  const productosUnicos = [...new Set(historial.map((h) => h.producto))];

  const statCards = [
    { label: "Total Registros", valor: historial.length, sublabel: "cambios registrados", color: "#B89B6A", border: "#B89B6A" },
    { label: "Aumentos", valor: aumentos, sublabel: "precios incrementados", color: "#1f2937", border: "#9ca3af" },
    { label: "Reducciones", valor: reducciones, sublabel: "precios reducidos", color: "#374151", border: "#ddd0b0" },
    { label: "Sin Cambio", valor: sinCambio, sublabel: "correcciones", color: "#6b7280", border: "#e5e7eb" },
  ];

  return (
    <div className="p-5" style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Historial de Precios</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Rastrea y analiza todos los cambios de precios de productos</p>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="card shadow-sm rounded-4" style={{ padding: "18px 20px", border: `1.5px solid ${card.border}` }}>
            <small style={{ color: card.color, fontSize: "13px", fontWeight: "600" }}>{card.label}</small>
            <h3 style={{ fontSize: "26px", fontWeight: "bold", color: card.color, margin: "4px 0" }}>{card.valor}</h3>
            <small style={{ color: "#6b7280", fontSize: "12px" }}>{card.sublabel}</small>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Búsqueda y Filtros</h6>
        <div className="d-flex gap-3" style={{ flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar por ID, producto, motivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <input
            type="date"
            className="form-control rounded-pill"
            style={{ maxWidth: 200 }}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <select
            className="form-select rounded-pill"
            style={{ maxWidth: 220 }}
            value={productoFiltro}
            onChange={(e) => setProductoFiltro(e.target.value)}
          >
            <option value="">Todos los productos</option>
            {productosUnicos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#B89B6A" }}>Registro Histórico de Precios</h6>
          <small style={{ color: "#6b7280" }}>{filtrado.length} registro{filtrado.length !== 1 ? "s" : ""} encontrado{filtrado.length !== 1 ? "s" : ""}</small>
        </div>
        <table className="table align-middle">
          <thead>
            <tr>
              {["ID Historial", "Producto", "Precio Anterior", "Precio Nuevo", "Variación", "Fecha Cambio", "Motivo", "Usuario"].map((col) => (
                <th key={col} style={{ fontSize: 12, whiteSpace: "nowrap" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrado.map((h) => (
              <tr key={h.id}>
                <td style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{h.id}</td>
                <td>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{h.producto}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{h.prod_id}</div>
                </td>
                <td style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{fmt(h.precio_anterior)}</td>
                <td style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{fmt(h.precio_nuevo)}</td>
                <td><VariacionCell item={h} /></td>
                <td style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{formatFecha(h.fecha_cambio)}</td>
                <td style={{ fontSize: 13, color: "#6b7280", maxWidth: 220 }}>{h.motivo}</td>
                <td style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{h.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}