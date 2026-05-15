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
      producto: 'Llanta Run-Flat Militar 20"',
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

    const coincideUsuario =
      usuario === "todos" ? true : mov.usuario === usuario;

    return coincideBusqueda && coincideTipo && coincideUsuario;
  });

  return (
    <div
      className="p-3"
      style={{
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <h5 className="fw-bold mb-1" style={{ color: "#121212" }}>
        Movimientos de Inventario
      </h5>

      <p style={{ color: "#6b7280" }} className="small mb-3">
        Historial de entradas y salidas de productos
      </p>

      {/* RESUMEN */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <div
            className="p-3 rounded-4 shadow-sm h-100"
            style={{
              background: "#fff",
              border: "1px solid #B89B6A",
            }}
          >
            <small style={{ color: "#B89B6A" }}>Total Entradas</small>

            <h5 className="mb-0" style={{ color: "#1E3A5F" }}>
              52
            </h5>

            <small style={{ color: "#6b7280" }}>
              unidades en el periodo filtrado
            </small>
          </div>
        </div>

        <div className="col-md-6 mb-2">
          <div
            className="p-3 rounded-4 shadow-sm h-100"
            style={{
              background: "#fff",
              border: "1px solid #B89B6A",
            }}
          >
            <small style={{ color: "#B89B6A" }}>Total Salidas</small>

            <h5 className="mb-0" style={{ color: "#C62828" }}>
              12
            </h5>

            <small style={{ color: "#6b7280" }}>
              unidades en el periodo filtrado
            </small>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div
        className="p-3 mb-4 shadow-sm rounded-4"
        style={{
          background: "#fff",
          border: "1px solid #B89B6A",
        }}
      >
        <h6 className="mb-3" style={{ color: "#121212" }}>
          Filtros y Búsqueda
        </h6>

        <div className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              maxWidth: "220px",
              border: "1px solid #B89B6A",
            }}
          />

          <select
            className="form-select form-select-sm"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{
              maxWidth: "160px",
              border: "1px solid #B89B6A",
            }}
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>

          <select
            className="form-select form-select-sm"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              maxWidth: "180px",
              border: "1px solid #B89B6A",
            }}
          >
            <option value="todos">Usuarios</option>
            <option>Sgt. Rodriguez</option>
            <option>Cap. Martinez</option>
            <option>Tte. Gomez</option>
          </select>

          <button
            className="btn btn-sm"
            style={{
              border: "1px solid #B89B6A",
              color: "#B89B6A",
            }}
            onClick={() => {
              setBusqueda("");
              setTipo("todos");
              setUsuario("todos");
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="mt-3">
        <h6 className="mb-3" style={{ color: "#121212" }}>
          Historial ({filtrados.length})
        </h6>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead
              style={{
                color: "#B89B6A",
                borderBottom: "2px solid #B89B6A",
              }}
            >
              <tr>
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

                  <td className="small fw-semibold">
                    {mov.producto}
                  </td>

                  <td>
                    <span
                      style={{
                        background:
                          mov.tipo === "entrada"
                            ? "#1E3A5F"
                            : "#3A3A3A",
                        color: "#fff",
                        padding: "5px 12px",
                        borderRadius: "14px",
                        fontSize: "11px",
                      }}
                    >
                      {mov.tipo === "entrada"
                        ? "Entrada"
                        : "Salida"}
                    </span>
                  </td>

                  <td
                    style={{
                      color:
                        mov.tipo === "entrada"
                          ? "#1E3A5F"
                          : "#C62828",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    {mov.cantidad > 0
                      ? `+${mov.cantidad}`
                      : mov.cantidad}
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