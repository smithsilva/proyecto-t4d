import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { RefreshCcw, AlertTriangle, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  getResumenVentas,
  getVentasPorSucursal,
  getMasVendidos,
  getStockBajo,
  getBalancePeriodo,
  getTopClientes,
} from "../../api/reportesApi";

const DORADO        = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO  = "#e7c98a";
const FONDO         = "#f7f1e3";
const ENCABEZADO    = "#13202e";
const TEXTO_ENCABEZADO = "#e7c98a";
const BTN_GRAD      = "linear-gradient(135deg, #c9941f, #8c6b3f)";

const COLORS = [DORADO, ENCABEZADO, DORADO_CLARO, "#6b7280", DORADO_OSCURO];
const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

function exportToExcel(balance, porSucursal, masVendidos, topClientes, stockBajo) {
  const wb = XLSX.utils.book_new();

  const wsBalance = XLSX.utils.json_to_sheet(
    balance.map((b) => ({ Período: b.periodo, Ingresos: b.ingresos, Egresos: b.egresos }))
  );
  wsBalance["!cols"] = [16, 16, 16].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsBalance, "Balance");

  const wsSucursal = XLSX.utils.json_to_sheet(
    porSucursal.map((s) => ({ Sucursal: s.sucursal, Ingresos: s.ingresos }))
  );
  wsSucursal["!cols"] = [24, 16].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsSucursal, "Por Sucursal");

  const wsProductos = XLSX.utils.json_to_sheet(
    masVendidos.map((p) => ({ Producto: p.nombre, "Unidades Usadas": p.unidades_usadas }))
  );
  wsProductos["!cols"] = [30, 16].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsProductos, "Productos");

  const wsClientes = XLSX.utils.json_to_sheet(
    topClientes.map((c) => ({ Cliente: c.nombre, Servicios: c.total_servicios, "Total Gastado": c.total_gastado }))
  );
  wsClientes["!cols"] = [30, 12, 16].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsClientes, "Top Clientes");

  if (stockBajo.length > 0) {
    const wsStock = XLSX.utils.json_to_sheet(
      stockBajo.map((p) => ({ ID: p.id_producto, Producto: p.nombre_producto, "Stock Actual": p.stock_actual }))
    );
    wsStock["!cols"] = [8, 30, 12].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, wsStock, "Stock Bajo");
  }

  XLSX.writeFile(wb, "reportes.xlsx");
}

function exportToWord(balance, porSucursal, masVendidos, topClientes, stockBajo) {
  const thStyle = `background:#13202e;color:#e7c98a;padding:7px 10px;font-size:11px;border:1px solid #374151`;
  const tdStyle = `padding:6px 10px;font-size:11px;border:1px solid #ddd`;

  const buildTable = (headers, rows) => `
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead><tr>${headers.map((h) => `<th style="${thStyle}">${h}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  const balanceRows = [...balance].reverse().map((b) => `
    <tr><td style="${tdStyle}">${b.periodo}</td><td style="${tdStyle}">${fmt(b.ingresos)}</td><td style="${tdStyle}">${fmt(b.egresos)}</td></tr>`).join("");

  const sucursalRows = porSucursal.map((s) => `
    <tr><td style="${tdStyle}">${s.sucursal}</td><td style="${tdStyle}">${fmt(s.ingresos)}</td></tr>`).join("");

  const productosRows = masVendidos.map((p) => `
    <tr><td style="${tdStyle}">${p.nombre}</td><td style="${tdStyle}">${p.unidades_usadas}</td></tr>`).join("");

  const clientesRows = topClientes.map((c) => `
    <tr><td style="${tdStyle}">${c.nombre}</td><td style="${tdStyle}">${c.total_servicios}</td><td style="${tdStyle}">${fmt(c.total_gastado)}</td></tr>`).join("");

  const stockRows = stockBajo.map((p) => `
    <tr><td style="${tdStyle}">#${p.id_producto}</td><td style="${tdStyle}">${p.nombre_producto}</td><td style="${tdStyle}">${p.stock_actual}</td></tr>`).join("");

  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>Reportes</title></head>
  <body style="font-family:Calibri,sans-serif;margin:40px;color:#1f2937">
    <h1 style="color:#8c6b3f;font-size:20px">Reportes y Análisis</h1>
    <h3 style="color:#13202e;font-size:14px">Balance por Período</h3>
    ${buildTable(["Período","Ingresos","Egresos"], balanceRows)}
    <h3 style="color:#13202e;font-size:14px">Ingresos por Sucursal</h3>
    ${buildTable(["Sucursal","Ingresos"], sucursalRows)}
    <h3 style="color:#13202e;font-size:14px">Productos Más Usados</h3>
    ${buildTable(["Producto","Unidades Usadas"], productosRows)}
    <h3 style="color:#13202e;font-size:14px">Top 10 Clientes</h3>
    ${buildTable(["Cliente","Servicios","Total Gastado"], clientesRows)}
    ${stockBajo.length > 0 ? `<h3 style="color:#c0392b;font-size:14px">⚠ Stock Bajo</h3>${buildTable(["ID","Producto","Stock Actual"], stockRows)}` : ""}
  </body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "reportes.doc"; a.click();
  URL.revokeObjectURL(url);
}

function exportToPDF(balance, porSucursal, masVendidos, topClientes, stockBajo) {
  const thStyle = `background:#13202e;color:#e7c98a;padding:7px 8px;font-size:11px;text-align:left`;
  const tdStyle = `padding:6px 8px;font-size:11px;border-bottom:1px solid #ece4d3`;

  const buildTable = (headers, rows) => `
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead><tr>${headers.map((h) => `<th style="${thStyle}">${h}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  const balanceRows = [...balance].reverse().map((b, i) => `
    <tr style="background:${i % 2 === 0 ? "#fffdf8" : "#f7f1e3"}">
      <td style="${tdStyle}">${b.periodo}</td><td style="${tdStyle}">${fmt(b.ingresos)}</td><td style="${tdStyle}">${fmt(b.egresos)}</td>
    </tr>`).join("");

  const sucursalRows = porSucursal.map((s, i) => `
    <tr style="background:${i % 2 === 0 ? "#fffdf8" : "#f7f1e3"}">
      <td style="${tdStyle}">${s.sucursal}</td><td style="${tdStyle}">${fmt(s.ingresos)}</td>
    </tr>`).join("");

  const productosRows = masVendidos.map((p, i) => `
    <tr style="background:${i % 2 === 0 ? "#fffdf8" : "#f7f1e3"}">
      <td style="${tdStyle}">${p.nombre}</td><td style="${tdStyle}">${p.unidades_usadas}</td>
    </tr>`).join("");

  const clientesRows = topClientes.map((c, i) => `
    <tr style="background:${i % 2 === 0 ? "#fffdf8" : "#f7f1e3"}">
      <td style="${tdStyle}">${c.nombre}</td><td style="${tdStyle}">${c.total_servicios}</td><td style="${tdStyle};font-weight:700;color:#8c6b3f">${fmt(c.total_gastado)}</td>
    </tr>`).join("");

  const stockRows = stockBajo.map((p, i) => `
    <tr style="background:${i % 2 === 0 ? "#fffdf8" : "#f7f1e3"}">
      <td style="${tdStyle}">#${p.id_producto}</td><td style="${tdStyle}">${p.nombre_producto}</td>
      <td style="${tdStyle}"><span style="background:#fbe2df;color:#c0392b;padding:2px 10px;border-radius:20px;font-weight:700">${p.stock_actual}</span></td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reportes</title>
  <style>
    @page{size:A4 landscape;margin:15mm}
    body{font-family:Arial,sans-serif;color:#1f2937;font-size:12px;background:#f7f1e3}
    h1{color:#8c6b3f;font-size:18px;margin-bottom:4px}
    h3{color:#13202e;font-size:13px;margin:18px 0 6px}
  </style></head><body>
    <h1>Reportes y Análisis</h1>
    <h3>Balance por Período</h3>
    ${buildTable(["Período","Ingresos","Egresos"], balanceRows)}
    <h3>Ingresos por Sucursal</h3>
    ${buildTable(["Sucursal","Ingresos"], sucursalRows)}
    <h3>Productos Más Usados</h3>
    ${buildTable(["Producto","Unidades Usadas"], productosRows)}
    <h3>Top 10 Clientes</h3>
    ${buildTable(["Cliente","Servicios","Total Gastado"], clientesRows)}
    ${stockBajo.length > 0 ? `<h3 style="color:#c0392b">⚠ Stock Bajo</h3>${buildTable(["ID","Producto","Stock Actual"], stockRows)}` : ""}
    <script>window.onload=()=>{window.print();}<\/script>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  URL.revokeObjectURL(url);
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

function Reportes() {
  const [resumen,     setResumen]     = useState(null);
  const [porSucursal, setPorSucursal] = useState([]);
  const [masVendidos, setMasVendidos] = useState([]);
  const [stockBajo,   setStockBajo]   = useState([]);
  const [balance,     setBalance]     = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState(null);
  const [exportMenu,  setExportMenu]  = useState(false);

  useEffect(() => { cargarTodo(); }, []);

  const cargarTodo = async () => {
    setCargando(true);
    setError(null);
    try {
      const [res, suc, vend, stock, bal, clientes] = await Promise.all([
        getResumenVentas(),
        getVentasPorSucursal(),
        getMasVendidos(),
        getStockBajo(),
        getBalancePeriodo(),
        getTopClientes(),
      ]);
      setResumen(res);
      setPorSucursal(suc);
      setMasVendidos(vend);
      setStockBajo(stock);
      setBalance(bal);
      setTopClientes(clientes);
    } catch (err) {
      setError("No se pudieron cargar los reportes: " + err.message);
    }
    setCargando(false);
  };

  const tarjeta = { backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` };

  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ ...tarjeta, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Reportes y Análisis{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              - Estadísticas y métricas del negocio
            </span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>

        {/* BOTONES */}
        <div className="d-flex gap-2">
          {/* ACTUALIZAR */}
          <button className="btn d-flex align-items-center gap-2 fw-semibold" onClick={cargarTodo}
            style={{ background: BTN_GRAD, color: "#fff", borderRadius: "8px", padding: "8px 18px 8px 8px", border: "none", boxShadow: "0 3px 12px rgba(140,107,63,0.55)" }}>
            <span className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.25)" }}>
              <RefreshCcw size={14} />
            </span>
            Actualizar
          </button>

          {/* EXPORTAR */}
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
                  {
                    label: "Exportar Excel",
                    action: () => { exportToExcel(balance, porSucursal, masVendidos, topClientes, stockBajo); setExportMenu(false); },
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#1D6F42"/><path d="M7 7l3 5-3 5h2.5l1.75-3L13 17h2.5l-3-5 3-5H13l-1.75 3L9.5 7H7z" fill="#fff"/></svg>,
                  },
                  {
                    label: "Exportar Word",
                    action: () => { exportToWord(balance, porSucursal, masVendidos, topClientes, stockBajo); setExportMenu(false); },
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#2B579A"/><path d="M6 8.5l2 7 2-5 2 5 2-7h-1.5l-1 4.5-1.5-4.5h-2l-1.5 4.5-1-4.5H6z" fill="#fff"/></svg>,
                  },
                  {
                    label: "Exportar PDF",
                    action: () => { exportToPDF(balance, porSucursal, masVendidos, topClientes, stockBajo); setExportMenu(false); },
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#E53935"/><path d="M7 6h6l4 4v8a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z" fill="#fff" opacity="0.15"/></svg>,
                  },
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
      </div>

      {/* Overlay para cerrar exportMenu */}
      {exportMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setExportMenu(false)} />
      )}

      {/* ERROR */}
      {error && (
        <div className="alert rounded-4" style={{ fontSize: 13, background: "#fbe2df", color: "#c0392b", border: "1px solid #f0b8b2" }}>
          {error}
        </div>
      )}

      {/* CARGANDO */}
      {cargando ? (
        <div className="text-center py-5" style={{ color: "#6b7280", fontSize: 14 }}>Cargando reportes...</div>
      ) : (
        <>
          {/* TARJETAS RESUMEN */}
          <div className="row g-3 mb-4">
            {[
              { title: "Total Servicios",      value: resumen?.total_servicios ?? "—" },
              { title: "Ingresos Totales",      value: fmt(resumen?.ingresos_totales) },
              { title: "Ticket Promedio",        value: fmt(resumen?.ticket_promedio) },
              { title: "Productos Stock Bajo",   value: stockBajo.length },
            ].map((item, i) => (
              <div className="col-12 col-sm-6 col-lg-3" key={i}>
                <div className="p-3 rounded-4 shadow-sm h-100"
                  style={{ background: ENCABEZADO, border: `1px solid ${DORADO_CLARO}`, color: "#fff" }}>
                  <small style={{ color: DORADO }}>{item.title}</small>
                  <h5 className="fw-bold mb-0" style={{ marginTop: 4 }}>{item.value}</h5>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3">

            {/* BALANCE */}
            <div className="col-12 col-xl-6">
              <div className="p-4 rounded-4 shadow-sm h-100" style={tarjeta}>
                <h6 className="fw-bold mb-3" style={{ color: "#1a1a1a" }}>Balance por Período</h6>
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <div style={{ minWidth: 500, height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...balance].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ece4d3" />
                        <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => fmt(v)} />
                        <Legend />
                        <Line type="monotone" dataKey="ingresos" stroke={DORADO} strokeWidth={3} />
                        <Line type="monotone" dataKey="egresos" stroke={ENCABEZADO} strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* POR SUCURSAL */}
            <div className="col-12 col-xl-6">
              <div className="p-4 rounded-4 shadow-sm h-100" style={tarjeta}>
                <h6 className="fw-bold mb-3" style={{ color: "#1a1a1a" }}>Ingresos por Sucursal</h6>
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <div style={{ minWidth: 500, height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={porSucursal}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ece4d3" />
                        <XAxis dataKey="sucursal" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => fmt(v)} />
                        <Legend />
                        <Bar dataKey="ingresos" fill={DORADO} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCTOS MÁS USADOS */}
            <div className="col-12 col-xl-6">
              <div className="p-4 rounded-4 shadow-sm h-100" style={tarjeta}>
                <h6 className="fw-bold mb-3" style={{ color: "#1a1a1a" }}>Productos Más Usados en Mantenimiento</h6>
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <div style={{ minWidth: 500, height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={masVendidos} dataKey="unidades_usadas" nameKey="nombre" cx="50%" cy="50%" outerRadius={80} label>
                          {masVendidos.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* TOP CLIENTES */}
            <div className="col-12 col-xl-6">
              <div className="p-4 rounded-4 shadow-sm h-100" style={tarjeta}>
                <h6 className="fw-bold mb-3" style={{ color: "#1a1a1a" }}>Top 10 Clientes</h6>
                <div style={{ overflowX: "auto" }}>
                  <table className="table table-sm align-middle mb-0" style={{ fontSize: 12 }}>
                    <thead>
                      <tr style={{ backgroundColor: ENCABEZADO }}>
                        {["Cliente", "Servicios", "Total Gastado"].map((h) => (
                          <th key={h} style={{ padding: "10px 12px", color: TEXTO_ENCABEZADO, border: "none", fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topClientes.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid #ece4d3" }}>
                          <td style={{ padding: "10px 12px" }}>{c.nombre}</td>
                          <td style={{ padding: "10px 12px" }}>{c.total_servicios}</td>
                          <td style={{ padding: "10px 12px", color: DORADO_OSCURO, fontWeight: 700 }}>{fmt(c.total_gastado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* STOCK BAJO */}
            {stockBajo.length > 0 && (
              <div className="col-12">
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: "#fffdf8", border: "1px solid #f0b8b2" }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <AlertTriangle size={18} color="#c0392b" />
                    <h6 className="fw-bold mb-0" style={{ color: "#c0392b" }}>
                      Productos con Stock Bajo (≤ 5 unidades)
                    </h6>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="table table-sm align-middle mb-0" style={{ fontSize: 12 }}>
                      <thead>
                        <tr style={{ backgroundColor: ENCABEZADO }}>
                          {["ID", "Producto", "Stock Actual"].map((h) => (
                            <th key={h} style={{ padding: "10px 12px", color: TEXTO_ENCABEZADO, border: "none", fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stockBajo.map((p) => (
                          <tr key={p.id_producto} style={{ borderBottom: "1px solid #ece4d3" }}>
                            <td style={{ padding: "10px 12px", color: DORADO_OSCURO, fontWeight: 700 }}>#{p.id_producto}</td>
                            <td style={{ padding: "10px 12px" }}>{p.nombre_producto}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{ background: "#fbe2df", color: "#c0392b", padding: "3px 12px", borderRadius: 20, fontWeight: 700, fontSize: 11 }}>
                                {p.stock_actual}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}

export default Reportes;