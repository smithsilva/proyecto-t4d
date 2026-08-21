import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { RefreshCcw, AlertTriangle, BarChart3 } from "lucide-react";
import {
  getResumenVentas,
  getVentasPorSucursal,
  getMasVendidos,
  getStockBajo,
  getBalancePeriodo,
  getTopClientes,
} from "../../api/reportesApi";

// =========================================
// PALETA (igual a Inventario.jsx)
// =========================================
const DORADO = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO = "#e7c98a";
const FONDO = "#f7f1e3";
const ENCABEZADO = "#13202e";
const TEXTO_ENCABEZADO = "#e7c98a";

const COLORS = [DORADO, ENCABEZADO, DORADO_CLARO, "#6b7280", DORADO_OSCURO];
const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

function Reportes() {
  const [resumen, setResumen] = useState(null);
  const [porSucursal, setPorSucursal] = useState([]);
  const [masVendidos, setMasVendidos] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [balance, setBalance] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarTodo();
  }, []);

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

  const tarjeta = {
    backgroundColor: "#fffdf8",
    border: `1px solid ${DORADO_CLARO}`,
  };

  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* ENCABEZADO (mismo estilo que Inventario) */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ ...tarjeta, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
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

        <button
          className="btn d-flex align-items-center gap-2 fw-semibold"
          onClick={cargarTodo}
          style={{
            background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`,
            color: "#fff",
            borderRadius: "8px",
            padding: "8px 18px 8px 8px",
            border: "none",
            boxShadow: "0 3px 12px rgba(140, 107, 63, 0.55)",
          }}
        >
          <span
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.25)" }}
          >
            <RefreshCcw size={14} />
          </span>
          Actualizar
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert rounded-4" style={{ fontSize: 13, background: "#fbe2df", color: "#c0392b", border: "1px solid #f0b8b2" }}>
          {error}
        </div>
      )}

      {/* CARGANDO */}
      {cargando ? (
        <div className="text-center py-5" style={{ color: "#6b7280", fontSize: 14 }}>
          Cargando reportes...
        </div>
      ) : (
        <>
          {/* TARJETAS RESUMEN */}
          <div className="row g-3 mb-4">
            {[
              { title: "Total Servicios",   value: resumen?.total_servicios ?? "—" },
              { title: "Ingresos Totales",  value: fmt(resumen?.ingresos_totales) },
              { title: "Ticket Promedio",   value: fmt(resumen?.ticket_promedio) },
              { title: "Productos Stock Bajo", value: stockBajo.length },
            ].map((item, i) => (
              <div className="col-12 col-sm-6 col-lg-3" key={i}>
                <div className="p-3 rounded-4 shadow-sm h-100" style={{ background: ENCABEZADO, border: `1px solid ${DORADO_CLARO}`, color: "#fff" }}>
                  <small style={{ color: DORADO }}>{item.title}</small>
                  <h5 className="fw-bold mb-0" style={{ marginTop: 4 }}>{item.value}</h5>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3">

            {/* INGRESOS VS EGRESOS POR PERIODO */}
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

            {/* INGRESOS POR SUCURSAL */}
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
                        <th style={{ padding: "10px 12px", color: TEXTO_ENCABEZADO, border: "none", fontWeight: 600 }}>Cliente</th>
                        <th style={{ padding: "10px 12px", color: TEXTO_ENCABEZADO, border: "none", fontWeight: 600 }}>Servicios</th>
                        <th style={{ padding: "10px 12px", color: TEXTO_ENCABEZADO, border: "none", fontWeight: 600 }}>Total Gastado</th>
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
                          <th style={{ padding: "10px 12px", color: TEXTO_ENCABEZADO, border: "none", fontWeight: 600 }}>ID</th>
                          <th style={{ padding: "10px 12px", color: TEXTO_ENCABEZADO, border: "none", fontWeight: 600 }}>Producto</th>
                          <th style={{ padding: "10px 12px", color: TEXTO_ENCABEZADO, border: "none", fontWeight: 600 }}>Stock Actual</th>
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