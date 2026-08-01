import { useState, useEffect } from "react";
import { Search, Plus, Eye, Pencil, Trash2, Download, TrendingUp, TrendingDown, FileText, DollarSign, Calendar, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../../Supabase/SupabaseClient";

const DORADO        = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO  = "#e7c98a";
const FONDO         = "#f7f1e3";
const ENCABEZADO    = "#13202e";
const TEXTO_ENC     = "#e7c98a";
const BTN_GRAD      = "linear-gradient(135deg, #c9941f, #8c6b3f)";

const fmt = (n) => `$ ${Number(n || 0).toLocaleString("es-CO")}`;

const badgeConfig = {
  Egreso:  { bg: "transparent", color: "#8c6b3f", border: "1.5px solid #d4a743" },
  Ingreso: { bg: "transparent", color: "#8c6b3f", border: "1.5px solid #d4a743" },
  Ajuste:  { bg: "transparent", color: "#b8860b", border: "1.5px solid #b8860b" },
};

const badgeValor = {
  Ingreso: { color: "#1f9d55", fondo: "#e3f7e9" },
  Egreso:  { color: "#c0392b", fondo: "#fbe2df" },
  Ajuste:  { color: "#b8860b", fondo: "#fdf3da" },
};

const fmtFechaLeg = (f) => {
  if (!f) return "—";
  const [y, m, d] = f.split("-");
  return `${d}/${m}/${y}`;
};

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

function exportToExcel(rows) {
  const data = rows.map((m) => ({
    "ID Movimiento":    m.id_movimiento,
    "Fecha":            m.fecha_movimiento,
    "Tipo":             m.tipo_movimiento,
    "Concepto":         m.concepto,
    "ID Mantenimiento": m.id_mantenimiento ?? "—",
    "Valor":            m.valor,
    "Cliente":          m.cliente ?? "—",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [10, 14, 10, 50, 16, 16, 25].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
  XLSX.writeFile(wb, "movimientos_contables.xlsx");
}

function exportToWord(rows, totals) {
  const tableRows = rows.map((m) => `
    <tr>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.id_movimiento}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${fmtFechaLeg(m.fecha_movimiento)}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.tipo_movimiento}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.concepto}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.id_mantenimiento ?? "—"}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px;text-align:right">${fmt(m.valor)}</td>
      <td style="border:1px solid #ccc;padding:6px;font-size:12px">${m.cliente ?? "—"}</td>
    </tr>`).join("");

  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>Movimientos Contables</title></head>
  <body style="font-family:Calibri,sans-serif;margin:40px;color:#1f2937">
    <h1 style="color:#8c6b3f;font-size:20px">Gestión de Movimientos Contables</h1>
    <table><thead><tr>${["ID","Fecha","Tipo","Concepto","ID Mantenimiento","Valor","Cliente"].map(h=>`<th style="background:#13202e;color:#e7c98a;padding:8px;font-size:12px;border:1px solid #374151">${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table>
  </body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "movimientos_contables.doc"; a.click();
  URL.revokeObjectURL(url);
}

function exportToPDF(rows, totals) {
  const tableRows = rows.map((m, i) => `
    <tr style="background:${i % 2 === 0 ? "#fffdf8" : "#f7f1e3"}">
      <td>${m.id_movimiento}</td>
      <td>${fmtFechaLeg(m.fecha_movimiento)}</td>
      <td>${m.tipo_movimiento}</td>
      <td>${m.concepto}</td>
      <td>${m.id_mantenimiento ?? "—"}</td>
      <td style="text-align:right;font-weight:600">${fmt(m.valor)}</td>
      <td>${m.cliente ?? "—"}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Movimientos Contables</title>
  <style>
    @page{size:A4 landscape;margin:15mm}
    body{font-family:Arial,sans-serif;color:#1f2937;font-size:12px;background:#f7f1e3}
    h1{color:#8c6b3f;font-size:18px}
    table{width:100%;border-collapse:collapse}
    th{background:#13202e;color:#e7c98a;padding:7px 8px;font-size:11px;text-align:left}
    td{padding:6px 8px;font-size:11px;border-bottom:1px solid #ece4d3}
  </style></head><body>
    <h1>Gestión de Movimientos Contables</h1>
    <table><thead><tr>${["ID","Fecha","Tipo","Concepto","ID Mantenimiento","Valor","Cliente"].map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table>
    <script>window.onload=()=>{window.print();}<\/script>
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

const cargarMovimientos = async () => {
  setCargando(true);

  const { data, error } = await supabase
    .from("movimientos_contables")
    .select(`
      id_movimiento,
      fecha_movimiento,
      tipo_movimiento,
      concepto,
      valor,
      id_asignacion,
      asignaciones_tareas (
        id_asignacion,
        clientes (
          id_cliente,
          nombre_completo
        )
      )
    `)
    .order("id_movimiento", { ascending: false });

  if (!error && data) {
    const idAsignaciones = [...new Set(data.map(m => m.id_asignacion).filter(Boolean))];

    let mantenimientosMap = {};
    if (idAsignaciones.length > 0) {
      const { data: mants, error: errorMants } = await supabase  // ← cambia esta línea
        .from("mantenimiento")
        .select("id_mantenimiento, id_asignacion")
        .in("id_asignacion", idAsignaciones);

      // ↓ AGREGA ESTAS 3 LÍNEAS AQUÍ
      console.log("idAsignaciones:", idAsignaciones);
      console.log("mants:", mants);
      console.log("errorMants:", errorMants);

      (mants || []).forEach(mn => {
        mantenimientosMap[mn.id_asignacion] = mn.id_mantenimiento;
      });
    }

    setMovimientos(
      data.map((m) => ({
        ...m,
        cliente:          m.asignaciones_tareas?.clientes?.nombre_completo ?? null,
        id_cliente:       m.asignaciones_tareas?.clientes?.id_cliente      ?? null,
        id_mantenimiento: mantenimientosMap[m.id_asignacion]               ?? null,
      }))
    );
  }

  setCargando(false);
};
  useEffect(() => { cargarMovimientos(); }, []);

  const totalIngresos = movimientos.filter(m => m.tipo_movimiento === "Ingreso").reduce((a, m) => a + Number(m.valor), 0);
  const totalEgresos  = movimientos.filter(m => m.tipo_movimiento === "Egreso" ).reduce((a, m) => a + Number(m.valor), 0);
  const totalAjustes  = movimientos.filter(m => m.tipo_movimiento === "Ajuste" ).reduce((a, m) => a + Number(m.valor), 0);
  const balance = totalIngresos - totalEgresos;
  const totals  = { totalIngresos, totalEgresos, totalAjustes, balance };

  const filtrados = movimientos.filter((m) => {
    const txt = busqueda.toLowerCase();
    const matchBusqueda = !txt || (m.concepto || "").toLowerCase().includes(txt) || String(m.id_movimiento).includes(txt);
    const matchTipo  = tipoFiltro === "Todos los tipos" || m.tipo_movimiento === tipoFiltro;
    const matchFecha = !fecha || m.fecha_movimiento === fecha;
    return matchBusqueda && matchTipo && matchFecha;
  });

  const statCards = [
    { label: "Total Ingresos", valor: fmt(totalIngresos), sublabel: "Entradas registradas", color: DORADO_OSCURO, border: DORADO_CLARO, Icon: TrendingUp  },
    { label: "Total Egresos",  valor: fmt(totalEgresos),  sublabel: "Salidas registradas",  color: "#1f2937",    border: "#9ca3af",   Icon: TrendingDown },
    { label: "Ajustes",        valor: fmt(totalAjustes),  sublabel: "Ajustes contables",    color: "#374151",    border: "#ddd0b0",   Icon: FileText     },
    {
      label: "Balance",
      valor: balance < 0 ? `-$ ${Math.abs(balance).toLocaleString("es-CO")}` : fmt(balance),
      sublabel: "Diferencia neta", color: DORADO_OSCURO, border: "#e5e7eb", Icon: DollarSign,
    },
  ];

  return (
    <div className="p-5" style={{ background: FONDO, minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Gestión de Movimientos Contables{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>- Administra los movimientos financieros</span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>

        {/* EXPORT DROPDOWN */}
        <div style={{ position: "relative" }}>
          <button className="btn d-flex align-items-center gap-2 fw-semibold"
            onClick={() => setExportMenu((v) => !v)}
            style={{ background: BTN_GRAD, color: "#fff", borderRadius: "8px", padding: "8px 18px 8px 8px", border: "none", boxShadow: "0 3px 12px rgba(140,107,63,0.55)" }}>
            <span className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.25)" }}>
              <Download size={14} />
            </span>
            Exportar ▾
          </button>

          {exportMenu && (
            <div style={{ position: "absolute", right: 0, top: "110%", zIndex: 999, background: "#fff", border: `1px solid ${DORADO_CLARO}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 170, overflow: "hidden" }}>
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
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f7f1e3"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                  {item.icon}<span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="rounded-4 shadow-sm"
            style={{ padding: "18px 20px", border: `1.5px solid ${card.border}`, background: "#fffdf8", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
      <div className="p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>
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
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ background: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center p-3">
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Registro de Movimientos</h6>
          <small style={{ color: "#6b7280" }}>{filtrados.length} movimientos registrados</small>
        </div>

        {cargando ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ display: "inline-block", width: 28, height: 28, border: `3px solid ${DORADO_CLARO}`, borderTop: `3px solid ${DORADO_OSCURO}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: 12, color: "#9ca3af", fontSize: 13 }}>Cargando movimientos...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ minWidth: "900px" }}>
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["ID Movimiento", "Fecha", "Tipo", "Concepto", "ID Mantenimiento", "Valor", "Cliente"].map((h) => (
                    <th key={h} style={{ fontSize: 13, whiteSpace: "nowrap", backgroundColor: ENCABEZADO, color: TEXTO_ENC, border: "none", padding: "12px 8px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5" style={{ fontSize: 13, color: "#9ca3af" }}>
                      {movimientos.length === 0 ? "No hay movimientos registrados aún." : "Sin resultados para los filtros aplicados."}
                    </td>
                  </tr>
                ) : (
                  filtrados.map((m) => {
                    const badge = badgeConfig[m.tipo_movimiento] || badgeConfig.Ajuste;
                    const bv    = badgeValor[m.tipo_movimiento]  || badgeValor.Ajuste;
                    return (
                      <tr key={m.id_movimiento} style={{ borderBottom: `1px solid #ece4d3`, backgroundColor: "#fffdf8" }}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <FileText size={14} color={DORADO_OSCURO} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: DORADO_OSCURO }}>#{m.id_movimiento}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1" style={{ fontSize: 13, color: "#6b7280" }}>
                            <Calendar size={13} color="#9ca3af" /> {fmtFechaLeg(m.fecha_movimiento)}
                          </div>
                        </td>
                        <td>
                          <span style={{ background: badge.bg, color: badge.color, border: badge.border, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, display: "inline-block" }}>
                            {m.tipo_movimiento}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: "#374151" }}>{m.concepto}</td>
                        <td>
                          {m.id_mantenimiento ? (
                            <span style={{ fontFamily: "monospace", fontSize: 12, background: "#f3f0e8", color: DORADO_OSCURO, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>
                              #{m.id_mantenimiento}
                            </span>
                          ) : (
                            <span style={{ fontFamily: "monospace", fontSize: 12, background: "#f3f0e8", color: "#6b7280", padding: "3px 8px", borderRadius: 5 }}>
                              —
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <span style={{ backgroundColor: bv.fondo, color: bv.color, fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "12px", display: "inline-block" }}>
                            {fmt(m.valor)}
                          </span>
                        </td>

                        {/* ── CLIENTE ── */}
                        <td style={{ fontSize: 13, color: "#374151" }}>
                          {m.cliente ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{m.cliente}</span>
                              <span style={{ fontSize: 11, color: "#6b7280" }}>ID: {m.id_cliente}</span>
                            </div>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {exportMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setExportMenu(false)} />
      )}
    </div>
  );
}