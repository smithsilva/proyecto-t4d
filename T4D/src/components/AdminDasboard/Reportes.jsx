import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import {
  getResumenVentas,
  getVentasPorSucursal,
  getMasVendidos,
  getStockBajo,
  getBalancePeriodo,
  getTopClientes,
} from "../../api/reportesApi";

const COLORS = ["#B89B6A", "#1f2937", "#d1d5db", "#6b7280", "#374151"];
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

  return (
    <div className="p-3" style={{ width: "100%", minHeight: "100vh", boxSizing: "border-box" }}>

      {/* TITULO */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold">Reportes y Análisis</h4>
          <small className="text-muted">Estadísticas y métricas del negocio</small>
        </div>
        <button
          className="btn btn-sm"
          onClick={cargarTodo}
          style={{ border: "1px solid #B89B6A", color: "#B89B6A" }}
        >
          Actualizar
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger rounded-4" style={{ fontSize: 13 }}>{error}</div>
      )}

      {/* CARGANDO */}
      {cargando ? (
        <div className="text-center py-5" style={{ color: "#6b7280", fontSize: 14 }}>
          Cargando reportes...
        </div>
      ) : (
        <>
          {/* TARJETAS RESUMEN */}
          <div className="row g-3 mb-3">
            {[
              { title: "Total Servicios",   value: resumen?.total_servicios ?? "—" },
              { title: "Ingresos Totales",  value: fmt(resumen?.ingresos_totales) },
              { title: "Ticket Promedio",   value: fmt(resumen?.ticket_promedio) },
              { title: "Productos Stock Bajo", value: stockBajo.length },
            ].map((item, i) => (
              <div className="col-12 col-sm-6 col-lg-3" key={i}>
                <div className="p-3 rounded-4 shadow-sm h-100" style={{ background: "#fff", border: "1px solid #B89B6A" }}>
                  <small style={{ color: "#6b7280" }}>{item.title}</small>
                  <h5 className="fw-bold mb-0" style={{ color: "#1f2937" }}>{item.value}</h5>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3">

            {/* INGRESOS VS EGRESOS POR PERIODO */}
            <div className="col-12 col-xl-6">
              <div className="bg-white p-3 rounded-4 shadow-sm h-100" style={{ border: "1px solid #eee" }}>
                <h6>Balance por Período</h6>
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <div style={{ minWidth: 500, height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...balance].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => fmt(v)} />
                        <Legend />
                        <Line type="monotone" dataKey="ingresos" stroke="#B89B6A" strokeWidth={3} />
                        <Line type="monotone" dataKey="egresos" stroke="#1f2937" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* INGRESOS POR SUCURSAL */}
            <div className="col-12 col-xl-6">
              <div className="bg-white p-3 rounded-4 shadow-sm h-100" style={{ border: "1px solid #eee" }}>
                <h6>Ingresos por Sucursal</h6>
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <div style={{ minWidth: 500, height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={porSucursal}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sucursal" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => fmt(v)} />
                        <Legend />
                        <Bar dataKey="ingresos" fill="#B89B6A" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCTOS MÁS USADOS */}
            <div className="col-12 col-xl-6">
              <div className="bg-white p-3 rounded-4 shadow-sm h-100" style={{ border: "1px solid #eee" }}>
                <h6>Productos Más Usados en Mantenimiento</h6>
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
              <div className="bg-white p-3 rounded-4 shadow-sm h-100" style={{ border: "1px solid #eee" }}>
                <h6>Top 10 Clientes</h6>
                <div style={{ overflowX: "auto" }}>
                  <table className="table table-sm align-middle" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Servicios</th>
                        <th>Total Gastado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topClientes.map((c) => (
                        <tr key={c.id}>
                          <td>{c.nombre}</td>
                          <td>{c.total_servicios}</td>
                          <td style={{ color: "#B89B6A", fontWeight: 600 }}>{fmt(c.total_gastado)}</td>
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
                <div className="bg-white p-3 rounded-4 shadow-sm" style={{ border: "1px solid #fecaca" }}>
                  <h6 style={{ color: "#dc2626" }}>⚠ Productos con Stock Bajo (≤ 5 unidades)</h6>
                  <div style={{ overflowX: "auto" }}>
                    <table className="table table-sm align-middle" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Producto</th>
                          <th>Stock Actual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockBajo.map((p) => (
                          <tr key={p.id_producto}>
                            <td style={{ color: "#6b7280" }}>#{p.id_producto}</td>
                            <td>{p.nombre_producto}</td>
                            <td>
                              <span style={{ background: "#fef2f2", color: "#dc2626", padding: "2px 10px", borderRadius: 20, fontWeight: 700, fontSize: 11 }}>
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