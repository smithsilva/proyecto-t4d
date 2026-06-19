import { useState, useEffect } from "react";
import { Search, Plus, Eye, Pencil, Trash2, Download, TrendingUp, TrendingDown, FileText, DollarSign, Calendar, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../../Supabase/SupabaseClient"; // ← ajusta la ruta

const fmt = (n) => `$ ${Number(n || 0).toLocaleString("es-CO")}`;

const badgeConfig = {
  Egreso:  { bg: "#1f2937", color: "#fff"  },
  Ingreso: { bg: "#B89B6A", color: "#000"  },
  Ajuste:  { bg: "#374151", color: "#fff"  },
};

const amountColor = {
  Egreso:  "#1f2937",
  Ingreso: "#B89B6A",
  Ajuste:  "#374151",
};

const fmtFechaLeg = (f) => {
  if (!f) return "—";
  const [y, m, d] = f.split("-");
  return `${d}/${m}/${y}`;
};

// ─── EXPORT HELPERS (sin cambios) ────────────────────────────────────────────

function exportToExcel(rows) {
  const data = rows.map((m) => ({
    "ID Movimiento":   m.id_movimiento,
    "Fecha":           m.fecha_movimiento,
    "Tipo":            m.tipo_movimiento,
    "Concepto":        m.concepto,
    "ID Mantenimiento": m.id_mantenimiento ?? "—",
    "Valor":           m.valor,
    "Usuario Registro": m.usuario ?? "—",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [10, 14, 10, 50, 16, 16, 20].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
  XLSX.writeFile(wb, "movimientos_contables.xlsx");
}

function exportToWord(rows, totals) {
  const { totalIngresos, totalEgresos, totalAjustes, balance } = totals;
  const tableRows = rows.map((m) => `
    <tr>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.id_movimiento}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${fmtFechaLeg(m.fecha_movimiento)}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.tipo_movimiento}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.concepto}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.id_mantenimiento ?? "—"}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px;text-align:right">${fmt(m.valor)}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.usuario ?? "—"}</td>
    </tr>`).join("");

  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>Movimientos Contables</title>
  <style>
    body{font-family:Calibri,sans-serif;margin:40px;color:#1f2937}
    h1{color:#B89B6A;font-size:20px;border-bottom:3px solid #B89B6A;padding-bottom:6px}
    table{border-collapse:collapse;width:100%;margin-top:10px}
    th{background:#1f2937;color:#fff;padding:8px;font-size:12px;text-align:left;border:1px solid #374151}
    tr:nth-child(even){background:#f9fafb}
    .footer{margin-top:30px;font-size:11px;color:#9ca3af}
  </style></head>
  <body>
    <h1>Gestión de Movimientos Contables</h1>
    <p style="color:#6b7280;font-size:13px;margin-top:-8px">Reporte generado el ${new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"})}</p>
    <table style="border-collapse:collapse;margin-bottom:20px">
      <tr>
        <td style="padding:10px 16px;border:1px solid #B89B6A;min-width:130px"><div style="font-size:11px;color:#6b7280;font-weight:600">Total Ingresos</div><div style="font-size:15px;font-weight:bold;color:#B89B6A">${fmt(totalIngresos)}</div></td>
        <td style="padding:10px 16px;border:1px solid #9ca3af;min-width:130px"><div style="font-size:11px;color:#6b7280;font-weight:600">Total Egresos</div><div style="font-size:15px;font-weight:bold;color:#1f2937">${fmt(totalEgresos)}</div></td>
        <td style="padding:10px 16px;border:1px solid #ddd0b0;min-width:130px"><div style="font-size:11px;color:#6b7280;font-weight:600">Ajustes</div><div style="font-size:15px;font-weight:bold;color:#374151">${fmt(totalAjustes)}</div></td>
        <td style="padding:10px 16px;border:1px solid #e5e7eb;min-width:130px"><div style="font-size:11px;color:#6b7280;font-weight:600">Balance</div><div style="font-size:15px;font-weight:bold;color:#B89B6A">${balance < 0 ? `-$ ${Math.abs(balance).toLocaleString("es-CO")}` : fmt(balance)}</div></td>
      </tr>
    </table>
    <table><thead><tr>${["ID","Fecha","Tipo","Concepto","ID Mantenimiento","Valor","Usuario"].map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table>
    <p class="footer">Sistema de Gestión de Movimientos Contables &bull; ${rows.length} registros exportados</p>
  </body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "movimientos_contables.doc"; a.click();
  URL.revokeObjectURL(url);
}

function exportToPDF(rows, totals) {
  const { totalIngresos, totalEgresos, totalAjustes, balance } = totals;
  const tableRows = rows.map((m, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"}">
      <td>${m.id_movimiento}</td>
      <td>${fmtFechaLeg(m.fecha_movimiento)}</td>
      <td><span style="background:${m.tipo_movimiento==="Ingreso"?"#B89B6A":m.tipo_movimiento==="Egreso"?"#1f2937":"#374151"};color:${m.tipo_movimiento==="Ingreso"?"#000":"#fff"};padding:2px 8px;border-radius:999px;font-size:10px">${m.tipo_movimiento}</span></td>
      <td>${m.concepto}</td>
      <td style="font-family:monospace;font-size:10px">${m.id_mantenimiento ?? "—"}</td>
      <td style="text-align:right;font-weight:600;color:${amountColor[m.tipo_movimiento]||"#374151"}">${fmt(m.valor)}</td>
      <td>${m.usuario ?? "—"}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Movimientos Contables</title>
  <style>
    @page{size:A4 landscape;margin:15mm}*{box-sizing:border-box}
    body{font-family:Arial,sans-serif;color:#1f2937;font-size:12px}
    h1{color:#B89B6A;font-size:18px;margin-bottom:2px}
    .gold-bar{width:50px;height:3px;background:#B89B6A;border-radius:4px;margin-bottom:14px}
    .stats{display:flex;gap:12px;margin-bottom:18px}
    .stat{border:1.5px solid #e5e7eb;border-radius:8px;padding:10px 14px;flex:1}
    .stat-label{font-size:10px;color:#6b7280;font-weight:600}
    .stat-value{font-size:14px;font-weight:bold;margin-top:3px}
    table{width:100%;border-collapse:collapse}
    th{background:#1f2937;color:#fff;padding:7px 8px;font-size:11px;text-align:left}
    td{padding:6px 8px;font-size:11px;border-bottom:1px solid #f0f0f0}
    .footer{margin-top:20px;font-size:10px;color:#9ca3af;text-align:center}
  </style></head><body>
    <h1>Gestión de Movimientos Contables</h1>
    <div class="gold-bar"></div>
    <div class="stats">
      <div class="stat" style="border-color:#B89B6A"><div class="stat-label">Total Ingresos</div><div class="stat-value" style="color:#B89B6A">${fmt(totalIngresos)}</div></div>
      <div class="stat" style="border-color:#9ca3af"><div class="stat-label">Total Egresos</div><div class="stat-value" style="color:#1f2937">${fmt(totalEgresos)}</div></div>
      <div class="stat" style="border-color:#ddd0b0"><div class="stat-label">Ajustes</div><div class="stat-value" style="color:#374151">${fmt(totalAjustes)}</div></div>
      <div class="stat" style="border-color:#e5e7eb"><div class="stat-label">Balance Neto</div><div class="stat-value" style="color:#B89B6A">${balance < 0 ? `-$ ${Math.abs(balance).toLocaleString("es-CO")}` : fmt(balance)}</div></div>
    </div>
    <table><thead><tr>${["ID","Fecha","Tipo","Concepto","ID Mantenimiento","Valor","Usuario"].map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table>
    <div class="footer">Sistema de Gestión de Movimientos Contables &bull; Documento generado automáticamente</div>
    <script>window.onload=()=>{window.print();}</script>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  URL.revokeObjectURL(url);
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function MovimientosContables() {
  const [movimientos,  setMovimientos]  = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [busqueda,     setBusqueda]     = useState("");
  const [fecha,        setFecha]        = useState("");
  const [tipoFiltro,   setTipoFiltro]   = useState("Todos los tipos");
  const [exportMenu,   setExportMenu]   = useState(false);

  // ── Cargar desde Supabase ─────────────────────────────────────────────────

  const cargarMovimientos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("movimientos_contables")
      .select(`
        id_movimiento,
        fecha_movimiento,
        tipo_movimiento,
        concepto,
        id_mantenimiento,
        valor,
        usuarios(username)
      `)
      .order("id_movimiento", { ascending: false });

    if (!error) {
      setMovimientos(
        (data || []).map((m) => ({
          ...m,
          usuario: m.usuarios?.username ?? null,
        }))
      );
    }
    setCargando(false);
  };

  useEffect(() => { cargarMovimientos(); }, []);

  // ── Totales ───────────────────────────────────────────────────────────────

  const totalIngresos = movimientos.filter(m => m.tipo_movimiento === "Ingreso").reduce((a, m) => a + Number(m.valor), 0);
  const totalEgresos  = movimientos.filter(m => m.tipo_movimiento === "Egreso" ).reduce((a, m) => a + Number(m.valor), 0);
  const totalAjustes  = movimientos.filter(m => m.tipo_movimiento === "Ajuste" ).reduce((a, m) => a + Number(m.valor), 0);
  const balance = totalIngresos - totalEgresos;
  const totals = { totalIngresos, totalEgresos, totalAjustes, balance };

  // ── Filtros ───────────────────────────────────────────────────────────────

  const filtrados = movimientos.filter((m) => {
    const txt = busqueda.toLowerCase();
    const matchBusqueda = !txt ||
      (m.concepto || "").toLowerCase().includes(txt) ||
      String(m.id_movimiento).includes(txt);
    const matchTipo  = tipoFiltro === "Todos los tipos" || m.tipo_movimiento === tipoFiltro;
    const matchFecha = !fecha || m.fecha_movimiento === fecha;
    return matchBusqueda && matchTipo && matchFecha;
  });

  const statCards = [
    { label: "Total Ingresos", valor: fmt(totalIngresos), sublabel: "Entradas registradas", color: "#B89B6A", border: "#B89B6A", Icon: TrendingUp  },
    { label: "Total Egresos",  valor: fmt(totalEgresos),  sublabel: "Salidas registradas",  color: "#1f2937", border: "#9ca3af", Icon: TrendingDown },
    { label: "Ajustes",        valor: fmt(totalAjustes),  sublabel: "Ajustes contables",    color: "#374151", border: "#ddd0b0", Icon: FileText     },
    { label: "Balance",
      valor: balance < 0 ? `-$ ${Math.abs(balance).toLocaleString("es-CO")}` : fmt(balance),
      sublabel: "Diferencia neta", color: "#B89B6A", border: "#e5e7eb", Icon: DollarSign },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

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
            <button className="btn rounded-pill btn-sm"
              style={{ border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={() => setExportMenu((v) => !v)}>
              <Download size={14} /> Exportar ▾
            </button>

            {exportMenu && (
              <div style={{ position: "absolute", right: 0, top: "110%", zIndex: 999, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 170, overflow: "hidden" }}>
                {[
                  { label: "Exportar Excel", action: () => { exportToExcel(filtrados); setExportMenu(false); },
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#1D6F42"/><path d="M7 7l3 5-3 5h2.5l1.75-3L13 17h2.5l-3-5 3-5H13l-1.75 3L9.5 7H7z" fill="#fff"/></svg> },
                  { label: "Exportar Word",  action: () => { exportToWord(filtrados, totals); setExportMenu(false); },
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#2B579A"/><path d="M6 8.5l2 7 2-5 2 5 2-7h-1.5l-1 4.5-1.5-4.5h-2l-1.5 4.5-1-4.5H6z" fill="#fff"/></svg> },
                  { label: "Exportar PDF",   action: () => { exportToPDF(filtrados, totals); setExportMenu(false); },
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#E53935"/><path d="M7 6h6l4 4v8a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z" fill="#fff" opacity="0.15"/></svg> },
                ].map((item) => (
                  <button key={item.label} onClick={item.action}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "9px 14px", background: "none", border: "none", fontSize: 13, color: "#374151", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                    {item.icon}<span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="card shadow-sm rounded-4"
            style={{ padding: "18px 20px", border: `1.5px solid ${card.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}><Search size={14} /></span>
            <input className="form-control rounded-pill" style={{ paddingLeft: 36, fontSize: 13 }}
              type="text" placeholder="Buscar por ID, concepto..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}><Calendar size={14} /></span>
            <input className="form-control rounded-pill" style={{ paddingLeft: 36, fontSize: 13, minWidth: 180 }}
              type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", zIndex: 1 }}><Filter size={14} /></span>
            <select className="form-select rounded-pill" style={{ paddingLeft: 36, fontSize: 13, minWidth: 180 }}
              value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
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

        {cargando ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ display: "inline-block", width: 28, height: 28, border: "3px solid #e5e7eb", borderTop: "3px solid #B89B6A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: 12, color: "#9ca3af", fontSize: 13 }}>Cargando movimientos...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                {["ID Movimiento", "Fecha", "Tipo", "Concepto", "ID Mantenimiento", "Valor", "Usuario Registro"].map((h) => (
                  <th key={h} style={{ fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted" style={{ fontSize: 13 }}>
                    {movimientos.length === 0 ? "No hay movimientos registrados aún." : "Sin resultados para los filtros aplicados."}
                  </td>
                </tr>
              ) : (
                filtrados.map((m) => {
                  const badge = badgeConfig[m.tipo_movimiento] || badgeConfig.Ajuste;
                  const color = amountColor[m.tipo_movimiento] || "#374151";
                  return (
                    <tr key={m.id_movimiento}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <FileText size={14} color="#B89B6A" />
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>#{m.id_movimiento}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1" style={{ fontSize: 13, color: "#6b7280" }}>
                          <Calendar size={13} color="#9ca3af" /> {fmtFechaLeg(m.fecha_movimiento)}
                        </div>
                      </td>
                      <td>
                        <span style={{ background: badge.bg, color: badge.color, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, display: "inline-block" }}>
                          {m.tipo_movimiento}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: "#374151" }}>{m.concepto}</td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: 12, background: "#f3f4f6", color: "#6b7280", padding: "3px 8px", borderRadius: 5 }}>
                          {m.id_mantenimiento ?? "—"}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600, color, textAlign: "right", whiteSpace: "nowrap" }}>
                        {fmt(m.valor)}
                      </td>
                      <td style={{ fontSize: 13, color: "#374151" }}>{m.usuario ?? "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {exportMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setExportMenu(false)} />
      )}
    </div>
  );
}