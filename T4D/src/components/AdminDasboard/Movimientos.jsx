import { useState } from "react";

function Movimientos() {
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [usuario, setUsuario] = useState("todos");

  const movimientos = [
    { fecha: "2024-02-05 09:30", usuario: "Sgt. Rodriguez", producto: "Placa Balística Nivel IIIA", tipo: "entrada", cantidad: 15 },
    { fecha: "2024-02-04 14:45", usuario: "Cap. Martinez", producto: "Motor Blindado V8 Diesel", tipo: "salida", cantidad: -1 },
    { fecha: "2024-02-04 11:20", usuario: "Tte. Gomez", producto: 'Llanta Run-Flat Militar 20"', tipo: "entrada", cantidad: 8 },
  ];

  const normalizar = (texto) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtrados = movimientos.filter((mov) => {
    const texto = normalizar(busqueda);
    const coincideBusqueda =
      normalizar(mov.producto).includes(texto) ||
      normalizar(mov.usuario).includes(texto);
    const coincideTipo = tipo === "todos" ? true : mov.tipo === tipo;
    const coincideUsuario = usuario === "todos" ? true : mov.usuario === usuario;
    return coincideBusqueda && coincideTipo && coincideUsuario;
  });

  return (
    <div
      className="p-5"
      style={{ background: "#fff", minHeight: "100vh" }}
    >
      {/* HEADER */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1">Movimientos de Inventario</h4>
        <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
        <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Historial de entradas y salidas de productos</p>
      </div>

      {/* RESUMEN */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Total Entradas</span>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#B89B6A" }}>52</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>unidades en el periodo filtrado</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Total Salidas</span>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#dc2626" }}>12</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>unidades en el periodo filtrado</div>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Filtros y Búsqueda</h6>
        <div className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ maxWidth: "220px", border: "1px solid #e5e7eb" }}
          />
          <select
            className="form-select form-select-sm"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ maxWidth: "160px", border: "1px solid #e5e7eb" }}
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
          <select
            className="form-select form-select-sm"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{ maxWidth: "180px", border: "1px solid #e5e7eb" }}
          >
            <option value="todos">Usuarios</option>
            <option>Sgt. Rodriguez</option>
            <option>Cap. Martinez</option>
            <option>Tte. Gomez</option>
          </select>
          <button
            className="btn btn-sm"
            style={{ border: "1px solid #B89B6A", color: "#B89B6A" }}
            onClick={() => { setBusqueda(""); setTipo("todos"); setUsuario("todos"); }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <h6 className="mb-3" style={{ color: "#111827" }}>Historial ({filtrados.length})</h6>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr style={{ color: "#B89B6A", borderBottom: "2px solid #B89B6A" }}>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((mov, index) => (
                <tr key={index}>
                  <td className="small">{mov.fecha}</td>
                  <td className="small">{mov.usuario}</td>
                  <td className="small fw-semibold">{mov.producto}</td>
                  <td>
                    <span
                      style={{
                        background: mov.tipo === "entrada" ? "#1f2937" : "#374151",
                        color: "#fff",
                        padding: "5px 12px",
                        borderRadius: "14px",
                        fontSize: "11px",
                      }}
                    >
                      {mov.tipo === "entrada" ? "Entrada" : "Salida"}
                    </span>
                  </td>
                  <td style={{ color: mov.tipo === "entrada" ? "#B89B6A" : "#dc2626", fontWeight: "bold", fontSize: "13px" }}>
                    {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Movimientos;