import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

function Reportes() {

  const dataLine = [
    { mes: "Ene", entradas: 120, salidas: 90 },
    { mes: "Feb", entradas: 200, salidas: 150 },
    { mes: "Mar", entradas: 170, salidas: 140 },
    { mes: "Abr", entradas: 220, salidas: 180 },
    { mes: "May", entradas: 240, salidas: 190 },
  ];

  const dataBar = [
    { mes: "Ene", devoluciones: 2 },
    { mes: "Feb", devoluciones: 5 },
    { mes: "Mar", devoluciones: 3 },
    { mes: "Abr", devoluciones: 7 },
    { mes: "May", devoluciones: 6 },
  ];

  const dataPie = [
    { name: "Entradas", value: 1277 },
    { name: "Salidas", value: 867 },
    { name: "Devoluciones", value: 27 },
  ];

  // COLORES

  const COLORS = [
    "#B89B6A",
    "#1f2937",
    "#d1d5db",
  ];

  return (
    <div
      className="p-3"
      style={{
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >

      {/* TITULO */}

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">

        <div>
          <h4 className="fw-bold">
            Reportes y Análisis
          </h4>

          <small className="text-muted">
            Estadísticas y métricas del negocio
          </small>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-sm"
            style={{
              border:
                "1px solid #B89B6A",
              color: "#B89B6A",
            }}
          >
            Exportar PDF
          </button>

          <button
            className="btn btn-sm"
            style={{
              border:
                "1px solid #B89B6A",
              color: "#B89B6A",
            }}
          >
            Exportar Excel
          </button>
        </div>
      </div>

      {/* FILTROS */}

      <div
        className="bg-white p-3 rounded-4 shadow-sm mb-3"
        style={{
          border:
            "1px solid #eee",
          width: "100%",
        }}
      >
        <h6>
          Configuración de Reporte
        </h6>

        <div className="d-flex gap-3 mt-2 flex-wrap">

          <select className="form-select">
            <option>
              Último mes
            </option>

            <option>
              Últimos 3 meses
            </option>
          </select>

          <select className="form-select">
            <option>
              Reporte de Productos
            </option>

            <option>
              Reporte de Ventas
            </option>
          </select>

        </div>
      </div>

      {/* TARJETAS */}

      <div className="row g-3 mb-3">

        {[
          {
            title:
              "Productos Ingresados",
            value: "1,277",
          },

          {
            title:
              "Salidas de Productos",
            value: "867",
          },

          {
            title:
              "Devoluciones",
            value: "27",
          },

          {
            title:
              "Reportes de Ventas",
            value: "156",
          },

        ].map((item, i) => (

          <div
            className="col-12 col-sm-6 col-lg-3"
            key={i}
          >
            <div
              className="p-3 rounded-4 shadow-sm h-100"
              style={{
                background:
                  "#fff",
                border:
                  "1px solid #B89B6A",
              }}
            >
              <small
                style={{
                  color:
                    "#6b7280",
                }}
              >
                {item.title}
              </small>

              <h5
                className="fw-bold mb-0"
                style={{
                  color:
                    "#1f2937",
                }}
              >
                {item.value}
              </h5>
            </div>
          </div>

        ))}

      </div>

      {/* GRÁFICAS */}

      <div className="row g-3">

        {/* LINE */}

        <div className="col-12 col-xl-6">

          <div
            className="bg-white p-3 rounded-4 shadow-sm h-100"
            style={{
              border:
                "1px solid #eee",
              width: "100%",
            }}
          >
            <h6>
              Tendencia de Entradas y Salidas
            </h6>

            <div
              style={{
                width: "100%",
                overflowX:
                  "auto",
              }}
            >

              <div
                style={{
                  minWidth: "500px",
                  height: "260px",
                }}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={dataLine}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="mes" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="entradas"
                      stroke="#B89B6A"
                      strokeWidth={3}
                    />

                    <Line
                      type="monotone"
                      dataKey="salidas"
                      stroke="#1f2937"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>

              </div>
            </div>
          </div>
        </div>

        {/* BAR */}

        <div className="col-12 col-xl-6">

          <div
            className="bg-white p-3 rounded-4 shadow-sm h-100"
            style={{
              border:
                "1px solid #eee",
              width: "100%",
            }}
          >
            <h6>
              Devoluciones de Garantía
            </h6>

            <div
              style={{
                width: "100%",
                overflowX:
                  "auto",
              }}
            >

              <div
                style={{
                  minWidth: "500px",
                  height: "260px",
                }}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={dataBar}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="mes" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="devoluciones"
                      fill="#B89B6A"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>

              </div>
            </div>
          </div>
        </div>

        {/* PIE */}

        <div className="col-12 col-xl-6">

          <div
            className="bg-white p-3 rounded-4 shadow-sm h-100"
            style={{
              border:
                "1px solid #eee",
              width: "100%",
            }}
          >
            <h6>
              Distribución General
            </h6>

            <div
              style={{
                width: "100%",
                overflowX:
                  "auto",
              }}
            >

              <div
                style={{
                  minWidth: "500px",
                  height: "260px",
                }}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={dataPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {dataPie.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={index}
                            fill={
                              COLORS[
                                index %
                                  COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>
                </ResponsiveContainer>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reportes;