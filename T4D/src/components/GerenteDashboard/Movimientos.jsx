import { useState } from "react";

function Movimientos() {
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [usuario, setUsuario] = useState("todos");

  const movimientos = [
    {
      fecha: "2024-02-05 09:30",
      usuario: "Sgt. Rodriguez",
      producto: "Placa Balística Nivel IIIA",
      tipo: "entrada",
      cantidad: 15,
    },
    {
      fecha: "2024-02-04 14:45",
      usuario: "Cap. Martinez",
      producto: "Motor Blindado V8 Diesel",
      tipo: "salida",
      cantidad: -1,
    },
    {
      fecha: "2024-02-04 11:20",
      usuario: "Tte. Gomez",
      producto: "Llanta Run-Flat Militar 20\"",
      tipo: "entrada",
      cantidad: 8,
    },
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
      style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}
    >

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Movimientos de Inventario</h4>
          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#B89B6A",
              borderRadius: "10px",
              marginBottom: "5px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Historial de entradas y salidas de productos
          </p>
        </div>
      </div>

      {/* TARJETAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          className="card shadow-sm rounded-4"
          style={{ padding: "20px", border: "1.5px solid #B89B6A" }}
        >
          <small style={{ color: "#B89B6A", fontSize: "13px", fontWeight: "600" }}>
            Total Entradas
          </small>
          <h3 style={{ fontSize: "26px", fontWeight: "bold", color: "#1f2937", margin: "4px 0" }}>
            52
          </h3>
          <small style={{ color: "#6b7280", fontSize: "12px" }}>
            unidades en el periodo filtrado
          </small>
        </div>
        <div
          className="card shadow-sm rounded-4"
          style={{ padding: "20px", border: "1.5px solid #B89B6A" }}
        >
          <small style={{ color: "#B89B6A", fontSize: "13px", fontWeight: "600" }}>
            Total Salidas
          </small>
          <h3 style={{ fontSize: "26px", fontWeight: "bold", color: "#dc2626", margin: "4px 0" }}>
            12
          </h3>
          <small style={{ color: "#6b7280", fontSize: "12px" }}>
            unidades en el periodo filtrado
          </small>
        </div>
      </div>

      {/* FILTROS */}
      <div
        className="card p-3 rounded-4 shadow-sm mb-4"
        style={{ background: "#fff", border: "1px solid #e5e7eb" }}
      >
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>
          Filtros y Búsqueda
        </h6>
        <div className="d-flex gap-3" style={{ flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar por producto o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className="form-select rounded-pill"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="todos">Todos los tipos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
          <select
            className="form-select rounded-pill"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="todos">Todos los usuarios</option>
            <option>Sgt. Rodriguez</option>
            <option>Cap. Martinez</option>
            <option>Tte. Gomez</option>
          </select>
          <button
            className="btn rounded-pill btn-sm"
            style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}
            onClick={() => { setBusqueda(""); setTipo("todos"); setUsuario("todos"); }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>
          Historial de Movimientos ({filtrados.length})
        </h6>
        <table className="table align-middle">
          <thead>
            <tr>
              {["Fecha", "Usuario", "Producto", "Tipo", "Cantidad"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((mov, index) => (
              <tr key={index}>
                <td>{mov.fecha}</td>
                <td>{mov.usuario}</td>
                <td>{mov.producto}</td>
                <td>
                  <span
                    style={{
                      background: mov.tipo === "entrada" ? "#1f2937" : "#374151",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "500",
                      display: "inline-block",
                      textTransform: "capitalize",
                    }}
                  >
                    {mov.tipo === "entrada" ? "Entrada" : "Salida"}
                  </span>
                </td>
                <td
                  className="fw-bold"
                  style={{ color: mov.tipo === "entrada" ? "#1f2937" : "#dc2626" }}
                >
                  {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Movimientos;