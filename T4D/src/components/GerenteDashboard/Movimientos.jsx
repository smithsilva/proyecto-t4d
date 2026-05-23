import { useState, useEffect } from "react";
import { supabase } from '../../Supabase/SupabaseClient';

function Movimientos() {
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [usuario, setUsuario] = useState("todos");
  const [movimientos, setMovimientos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarMovimientos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('movimientos_inventario')
      .select(`
        id_movimiento,
        fecha_movimiento,
        tipo_movimiento,
        cantidad,
        observacion,
        productos (
          nombre_producto
        ),
        usuarios (
          username
        )
      `)
      .order('fecha_movimiento', { ascending: false });

    if (!error && data) {
      const formateados = data.map((m) => ({
        id: m.id_movimiento,
        fecha: m.fecha_movimiento
          ? new Date(m.fecha_movimiento).toLocaleString('es-CO', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit',
            })
          : '—',
        usuario: m.usuarios?.username || '—',
        producto: m.productos?.nombre_producto || '—',
        tipo: m.tipo_movimiento,
        cantidad: m.tipo_movimiento === 'salida' ? -Math.abs(m.cantidad) : Math.abs(m.cantidad),
        observacion: m.observacion || '',
      }));
      setMovimientos(formateados);

      // Usuarios únicos para el filtro
      const unicos = [...new Set(formateados.map(m => m.usuario).filter(u => u !== '—'))];
      setUsuarios(unicos);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

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

  const totalEntradas = filtrados
    .filter(m => m.tipo === 'entrada')
    .reduce((a, m) => a + Math.abs(m.cantidad), 0);

  const totalSalidas = filtrados
    .filter(m => m.tipo === 'salida')
    .reduce((a, m) => a + Math.abs(m.cantidad), 0);

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
        <button
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", fontSize: "13px", padding: "8px 18px" }}
          onClick={() => cargarMovimientos()}
        >
          ↻ Actualizar
        </button>
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
            {totalEntradas}
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
            {totalSalidas}
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
            {usuarios.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
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

        {cargando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
            Cargando movimientos...
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
            No se encontraron movimientos.
          </div>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                {["Fecha", "Usuario", "Producto", "Tipo", "Cantidad", "Observación"].map((h) => (
                  <th key={h} style={{ fontSize: "12px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((mov) => (
                <tr key={mov.id}>
                  <td style={{ fontSize: "13px" }}>{mov.fecha}</td>
                  <td style={{ fontSize: "13px" }}>{mov.usuario}</td>
                  <td style={{ fontSize: "13px", fontWeight: "600" }}>{mov.producto}</td>
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
                    style={{ color: mov.tipo === "entrada" ? "#1f2937" : "#dc2626", fontSize: "13px" }}
                  >
                    {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                  </td>
                  <td style={{ fontSize: "12px", color: "#6b7280" }}>{mov.observacion || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default Movimientos;