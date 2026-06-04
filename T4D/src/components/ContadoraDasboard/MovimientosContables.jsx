import { useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, Download, TrendingUp, TrendingDown, FileText, DollarSign, Calendar, Filter } from "lucide-react";
import * as XLSX from "xlsx";

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

// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────

function exportToExcel(rows) {
  const data = rows.map((m) => ({
    "ID Movimiento":    m.id,
    "Fecha":            m.fecha,
    "Tipo":             m.tipo,
    "Concepto":         m.concepto,
    "ID Mantenimiento": m.mantenimiento,
    "Valor":            m.valor,
    "Usuario Registro": m.usuario,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  // Column widths
  ws["!cols"] = [10, 20, 10, 50, 16, 16, 20].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
  XLSX.writeFile(wb, "movimientos_contables.xlsx");
}

function exportToWord(rows, totals) {
  const { totalIngresos, totalEgresos, totalAjustes, balance } = totals;

  const tableRows = rows
    .map(
      (m) => `
      <tr>
        <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.id}</td>
        <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.fecha}</td>
        <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.tipo}</td>
        <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.concepto}</td>
        <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.mantenimiento}</td>
        <td style="border:1px solid #ccc;padding:6px;font-size:12px;text-align:right">${fmt(m.valor)}</td>
        <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.usuario}</td>
      </tr>`
    )
    .join("");

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Movimientos Contables</title>
    <style>
      body { font-family: Calibri, sans-serif; margin: 40px; color: #1f2937; }
      h1   { color: #B89B6A; font-size: 20px; border-bottom: 3px solid #B89B6A; padding-bottom: 6px; }
      .summary { display: flex; gap: 20px; margin-bottom: 20px; }
      .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; min-width: 130px; }
      .card-label { font-size: 11px; color: #6b7280; font-weight: 600; }
      .card-value { font-size: 15px; font-weight: bold; margin-top: 4px; }
      table { border-collapse: collapse; width: 100%; margin-top: 10px; }
      th    { background: #1f2937; color: #fff; padding: 8px; font-size: 12px; text-align: left; border: 1px solid #374151; }
      tr:nth-child(even) { background: #f9fafb; }
      .footer { margin-top: 30px; font-size: 11px; color: #9ca3af; }
    </style>
    </head>
    <body>
      <h1>Gestión de Movimientos Contables</h1>
      <p style="color:#6b7280;font-size:13px;margin-top:-8px">
        Reporte generado el ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <table style="border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="padding:10px 16px;border:1px solid #B89B6A;border-radius:4px;min-width:130px">
            <div style="font-size:11px;color:#6b7280;font-weight:600">Total Ingresos</div>
            <div style="font-size:15px;font-weight:bold;color:#B89B6A">${fmt(totalIngresos)}</div>
          </td>
          <td style="padding:10px 16px;border:1px solid #9ca3af;min-width:130px">
            <div style="font-size:11px;color:#6b7280;font-weight:600">Total Egresos</div>
            <div style="font-size:15px;font-weight:bold;color:#1f2937">${fmt(totalEgresos)}</div>
          </td>
          <td style="padding:10px 16px;border:1px solid #ddd0b0;min-width:130px">
            <div style="font-size:11px;color:#6b7280;font-weight:600">Ajustes</div>
            <div style="font-size:15px;font-weight:bold;color:#374151">${fmt(totalAjustes)}</div>
          </td>
          <td style="padding:10px 16px;border:1px solid #e5e7eb;min-width:130px">
            <div style="font-size:11px;color:#6b7280;font-weight:600">Balance</div>
            <div style="font-size:15px;font-weight:bold;color:#B89B6A">
              ${balance < 0 ? `-$ ${Math.abs(balance).toLocaleString("es-CO")}` : fmt(balance)}
            </div>
          </td>
        </tr>
      </table>

      <table>
        <thead>
          <tr>
            ${["ID Movimiento","Fecha","Tipo","Concepto","ID Mantenimiento","Valor","Usuario Registro"]
              .map((h) => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>

      <p class="footer">Sistema de Gestión de Movimientos Contables &bull; ${rows.length} registros exportados</p>
    </body>
    </html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "movimientos_contables.doc";
  a.click();
  URL.revokeObjectURL(url);
}

function exportToPDF(rows, totals) {
  const { totalIngresos, totalEgresos, totalAjustes, balance } = totals;

  const tableRows = rows
    .map(
      (m, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"}">
        <td>${m.id}</td>
        <td>${m.fecha}</td>
        <td><span style="background:${m.tipo==="Ingreso"?"#B89B6A":m.tipo==="Egreso"?"#1f2937":"#374151"};
                        color:${m.tipo==="Ingreso"?"#000":"#fff"};
                        padding:2px 8px;border-radius:999px;font-size:10px">${m.tipo}</span></td>
        <td>${m.concepto}</td>
        <td style="font-family:monospace;font-size:10px">${m.mantenimiento}</td>
        <td style="text-align:right;font-weight:600;color:${amountColor[m.tipo]||"#374151"}">${fmt(m.valor)}</td>
        <td>${m.usuario}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Movimientos Contables</title>
    <style>
      @page { size: A4 landscape; margin: 15mm; }
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; color: #1f2937; font-size: 12px; }
      h1   { color: #B89B6A; font-size: 18px; margin-bottom: 2px; }
      .subtitle { color: #6b7280; font-size: 11px; margin-bottom: 16px; }
      .gold-bar { width: 50px; height: 3px; background: #B89B6A; border-radius: 4px; margin-bottom: 14px; }
      .stats { display: flex; gap: 12px; margin-bottom: 18px; }
      .stat { border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; flex: 1; }
      .stat-label { font-size: 10px; color: #6b7280; font-weight: 600; }
      .stat-value { font-size: 14px; font-weight: bold; margin-top: 3px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #1f2937; color: #fff; padding: 7px 8px; font-size: 11px; text-align: left; }
      td { padding: 6px 8px; font-size: 11px; border-bottom: 1px solid #f0f0f0; }
      .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; text-align: center; }
    </style>
  </head>
  <body>
    <h1>Gestión de Movimientos Contables</h1>
    <div class="gold-bar"></div>
    <p class="subtitle">
      Reporte generado el ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
      &bull; ${rows.length} registros
    </p>

    <div class="stats">
      <div class="stat" style="border-color:#B89B6A">
        <div class="stat-label">Total Ingresos</div>
        <div class="stat-value" style="color:#B89B6A">${fmt(totalIngresos)}</div>
      </div>
      <div class="stat" style="border-color:#9ca3af">
        <div class="stat-label">Total Egresos</div>
        <div class="stat-value" style="color:#1f2937">${fmt(totalEgresos)}</div>
      </div>
      <div class="stat" style="border-color:#ddd0b0">
        <div class="stat-label">Ajustes</div>
        <div class="stat-value" style="color:#374151">${fmt(totalAjustes)}</div>
      </div>
      <div class="stat" style="border-color:#e5e7eb">
        <div class="stat-label">Balance Neto</div>
        <div class="stat-value" style="color:#B89B6A">
          ${balance < 0 ? `-$ ${Math.abs(balance).toLocaleString("es-CO")}` : fmt(balance)}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          ${["ID Movimiento","Fecha","Tipo","Concepto","ID Mantenimiento","Valor","Usuario Registro"]
            .map((h) => `<th>${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    <div class="footer">Sistema de Gestión de Movimientos Contables &bull; Documento generado automáticamente</div>
    <script>window.onload = () => { window.print(); }</script>
  </body>
  </html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function MovimientosContables() {
  const [busqueda,   setBusqueda]   = useState("");
  const [fecha,      setFecha]      = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos los tipos");
  const [exportMenu, setExportMenu] = useState(false);

  const movimientos = DATA;

  const totalIngresos = movimientos.filter(m => m.tipo === "Ingreso").reduce((a, m) => a + m.valor, 0);
  const totalEgresos  = movimientos.filter(m => m.tipo === "Egreso" ).reduce((a, m) => a + m.valor, 0);
  const totalAjustes  = movimientos.filter(m => m.tipo === "Ajuste" ).reduce((a, m) => a + m.valor, 0);
  const balance       = totalIngresos - totalEgresos;
  const totals        = { totalIngresos, totalEgresos, totalAjustes, balance };

  const filtrados = movimientos.filter((m) => {
    const matchBusqueda = m.concepto.toLowerCase().includes(busqueda.toLowerCase()) || m.id.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = tipoFiltro === "Todos los tipos" || m.tipo === tipoFiltro;
    return matchBusqueda && matchTipo;
  });

  const statCards = [
    { label: "Total Ingresos", valor: fmt(totalIngresos), sublabel: "Entradas registradas", color: "#B89B6A", border: "#B89B6A", Icon: TrendingUp },
    { label: "Total Egresos",  valor: fmt(totalEgresos),  sublabel: "Salidas registradas",  color: "#1f2937", border: "#9ca3af", Icon: TrendingDown },
    { label: "Ajustes",        valor: fmt(totalAjustes),  sublabel: "Ajustes contables",    color: "#374151", border: "#ddd0b0", Icon: FileText },
    { label: "Balance",        valor: balance < 0 ? `-$ ${Math.abs(balance).toLocaleString("es-CO")}` : fmt(balance), sublabel: "Diferencia neta", color: "#B89B6A", border: "#e5e7eb", Icon: DollarSign },
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
          {/* EXPORT DROPDOWN */}
          <div style={{ position: "relative" }}>
            <button
              className="btn rounded-pill btn-sm"
              style={{ border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={() => setExportMenu((v) => !v)}
            >
              <Download size={14} /> Exportar ▾
            </button>

            {exportMenu && (
              <div style={{
                position: "absolute", right: 0, top: "110%", zIndex: 999,
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 170, overflow: "hidden",
              }}>
                {[
                  {
                    label: "Exportar Excel",
                    action: () => { exportToExcel(filtrados); setExportMenu(false); },
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="4" fill="#1D6F42"/>
                        <path d="M7 7l3 5-3 5h2.5l1.75-3L13 17h2.5l-3-5 3-5H13l-1.75 3L9.5 7H7z" fill="#fff"/>
                        <rect x="14" y="7" width="3" height="1.5" rx="0.5" fill="#fff" opacity="0.6"/>
                        <rect x="14" y="10.25" width="3" height="1.5" rx="0.5" fill="#fff" opacity="0.6"/>
                        <rect x="14" y="13.5" width="3" height="1.5" rx="0.5" fill="#fff" opacity="0.6"/>
                      </svg>
                    ),
                    accent: "#1D6F42",
                  },
                  {
                    label: "Exportar Word",
                    action: () => { exportToWord(filtrados, totals); setExportMenu(false); },
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="4" fill="#2B579A"/>
                        <path d="M5 7h14v1.5H5V7zm0 4.5h8V13H5v-1.5zm0 4.5h14V17.5H5V16z" fill="#fff" opacity="0.25"/>
                        <path d="M6 8.5l2 7 2-5 2 5 2-7h-1.5l-1 4.5-1.5-4.5h-2l-1.5 4.5-1-4.5H6z" fill="#fff"/>
                      </svg>
                    ),
                    accent: "#2B579A",
                  },
                  {
                    label: "Exportar PDF",
                    action: () => { exportToPDF(filtrados, totals); setExportMenu(false); },
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="4" fill="#E53935"/>
                        <path d="M7 6h6l4 4v8a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z" fill="#fff" opacity="0.15"/>
                        <path d="M13 6l4 4h-3a1 1 0 01-1-1V6z" fill="#fff" opacity="0.5"/>
                        <path d="M8.5 13.5h2c.8 0 1.3-.5 1.3-1.2S11.3 11 10.5 11H8v5h.5v-2.5zm0-2h1.9c.5 0 .8.3.8.8s-.3.8-.8.8H8.5v-1.6zm4 5H14c1.1 0 1.8-.7 1.8-2s-.7-2-1.8-2h-1.5v4zm.5-3.5h.9c.8 0 1.3.5 1.3 1.5s-.5 1.5-1.3 1.5H13v-3z" fill="#fff"/>
                      </svg>
                    ),
                    accent: "#E53935",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", textAlign: "left",
                      padding: "9px 14px", background: "none", border: "none",
                      fontSize: 13, color: "#374151", cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

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
                      background: badge.bg, color: badge.color,
                      padding: "4px 10px", borderRadius: 999,
                      fontSize: 11, fontWeight: 600, display: "inline-block",
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
                      <Eye    size={18} style={{ cursor: "pointer", color: "#374151" }} title="Ver" />
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

      {/* Cerrar menú al hacer clic fuera */}
      {exportMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 998 }}
          onClick={() => setExportMenu(false)}
        />
      )}
    </div>
  );
}