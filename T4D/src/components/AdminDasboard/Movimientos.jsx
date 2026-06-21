import { useState, useEffect } from "react";
import { supabase } from '../../Supabase/SupabaseClient';
import { Filter, Search, X } from "lucide-react";

// ─── Paleta ───────────────────────────────────────────────────────
const DORADO        = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO  = "#e7c98a";
const FONDO         = "#f7f1e3";
const ENCABEZADO    = "#13202e";
const TEXTO_ENC     = "#e7c98a";

function Movimientos() {
  const [busqueda,    setBusqueda]    = useState("");
  const [tipo,        setTipo]        = useState("todos");
  const [usuario,     setUsuario]     = useState("todos");
  const [movimientos, setMovimientos] = useState([]);
  const [usuarios,    setUsuarios]    = useState([]);
  const [cargando,    setCargando]    = useState(true);

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
        productos ( nombre_producto ),
        usuarios  ( username )
      `)
      .order('fecha_movimiento', { ascending: false });

    if (!error && data) {
      const formateados = data.map((m) => ({
        id:          m.id_movimiento,
        fecha:       m.fecha_movimiento
          ? new Date(m.fecha_movimiento).toLocaleString('es-CO', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit',
            })
          : '—',
        usuario:     m.usuarios?.username        || '—',
        producto:    m.productos?.nombre_producto || '—',
        tipo:        m.tipo_movimiento,
        cantidad:    m.tipo_movimiento === 'salida'
          ? -Math.abs(m.cantidad)
          :  Math.abs(m.cantidad),
        observacion: m.observacion || '',
      }));
      setMovimientos(formateados);
      const unicos = [...new Set(formateados.map(m => m.usuario).filter(u => u !== '—'))];
      setUsuarios(unicos);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarMovimientos();
    const canal = supabase
      .channel('movimientos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movimientos_inventario' }, cargarMovimientos)
      .subscribe();
    return () => supabase.removeChannel(canal);
  }, []);

  const normalizar = (texto) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtrados = movimientos.filter((mov) => {
    const texto = normalizar(busqueda);
    const coincideBusqueda =
      normalizar(mov.producto).includes(texto) ||
      normalizar(mov.usuario).includes(texto);
    const coincideTipo    = tipo    === "todos" ? true : mov.tipo    === tipo;
    const coincideUsuario = usuario === "todos" ? true : mov.usuario === usuario;
    return coincideBusqueda && coincideTipo && coincideUsuario;
  });

  const totalEntradas = filtrados
    .filter(m => m.tipo === 'entrada')
    .reduce((a, m) => a + Math.abs(m.cantidad), 0);

  const totalSalidas = filtrados
    .filter(m => m.tipo === 'salida')
    .reduce((a, m) => a + Math.abs(m.cantidad), 0);

  const getBadgeTipo = (tipo) => {
    const esEntrada = tipo === 'entrada';
    return (
      <span style={{
        backgroundColor: esEntrada ? "#e3f7e9" : "#fbe2df",
        color:           esEntrada ? "#1f9d55" : "#c0392b",
        fontSize: "12px", fontWeight: 600,
        padding: "4px 12px", borderRadius: "12px",
        display: "inline-block", textTransform: "capitalize",
      }}>
        {esEntrada ? "Entrada" : "Salida"}
      </span>
    );
  };

  return (
    <div
      className="p-4"
      style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}
    >

      {/* HEADER — sin botones de exportar/actualizar */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{
          backgroundColor: "#fffdf8",
          border: `1px solid ${DORADO_CLARO}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Movimientos de Inventario{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              — Historial de entradas y salidas
            </span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
      </div>

      {/* TARJETAS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div
          className="card shadow-sm rounded-4"
          style={{ padding: "20px", backgroundColor: "#fffdf8", border: `1.5px solid ${DORADO_CLARO}` }}
        >
          <small style={{ color: DORADO_OSCURO, fontSize: "13px", fontWeight: "600" }}>Total Entradas</small>
          <h3 style={{ fontSize: "26px", fontWeight: "bold", color: "#1f2937", margin: "4px 0" }}>{totalEntradas}</h3>
          <small style={{ color: "#6b7280", fontSize: "12px" }}>unidades en el periodo filtrado</small>
        </div>
        <div
          className="card shadow-sm rounded-4"
          style={{ padding: "20px", backgroundColor: "#fffdf8", border: `1.5px solid ${DORADO_CLARO}` }}
        >
          <small style={{ color: DORADO_OSCURO, fontSize: "13px", fontWeight: "600" }}>Total Salidas</small>
          <h3 style={{ fontSize: "26px", fontWeight: "bold", color: "#dc2626", margin: "4px 0" }}>{totalSalidas}</h3>
          <small style={{ color: "#6b7280", fontSize: "12px" }}>unidades en el periodo filtrado</small>
        </div>
      </div>

      {/* FILTROS */}
      <div
        className="p-4 rounded-4 shadow-sm mb-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}
      >
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>

        <div className="d-flex gap-3 flex-wrap align-items-end">
          <div style={{ flex: "2 1 200px", position: "relative" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: DORADO_OSCURO, marginBottom: "4px", display: "block" }}>Buscar</label>
            <Search size={16} style={{ position: "absolute", left: "14px", bottom: "11px", color: "#999" }} />
            <input
              type="text"
              className="form-control rounded-pill"
              style={{ paddingLeft: "36px" }}
              placeholder="Buscar por producto o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div style={{ flex: "1 1 150px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: DORADO_OSCURO, marginBottom: "4px", display: "block" }}>Tipo</label>
            <select className="form-select rounded-pill" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="todos">Todos los tipos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </div>

          <div style={{ flex: "1 1 150px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: DORADO_OSCURO, marginBottom: "4px", display: "block" }}>Usuario</label>
            <select className="form-select rounded-pill" value={usuario} onChange={(e) => setUsuario(e.target.value)}>
              <option value="todos">Todos los usuarios</option>
              {usuarios.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <button
            className="d-flex align-items-center gap-1 fw-semibold"
            style={{
              color: DORADO_OSCURO, border: `1px solid ${DORADO_OSCURO}`,
              borderRadius: "20px", padding: "8px 16px",
              whiteSpace: "nowrap", background: "#fff", cursor: "pointer",
            }}
            onClick={() => { setBusqueda(""); setTipo("todos"); setUsuario("todos"); }}
          >
            <X size={14} /> Limpiar Filtros
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="px-3 pt-3 pb-1">
          <h6 className="fw-bold mb-2" style={{ color: "#1a1a1a", fontSize: "16px" }}>
            Historial de Movimientos ({filtrados.length})
          </h6>
        </div>

        {cargando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
            Cargando movimientos...
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
            No se encontraron movimientos.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ backgroundColor: "#fffdf8" }}>
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["Fecha", "Usuario", "Producto", "Tipo", "Cantidad", "Observación"].map((h) => (
                    <th key={h} style={{ backgroundColor: ENCABEZADO, color: TEXTO_ENC, fontSize: "13px", border: "none", padding: "12px 10px", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((mov) => (
                  <tr key={mov.id} style={{ borderBottom: `1px solid #ece4d3`, backgroundColor: "#fffdf8" }}>
                    <td style={{ fontSize: "13px" }}>{mov.fecha}</td>
                    <td style={{ fontSize: "13px" }}>{mov.usuario}</td>
                    <td style={{ fontSize: "13px", fontWeight: "600" }}>{mov.producto}</td>
                    <td>{getBadgeTipo(mov.tipo)}</td>
                    <td className="fw-bold" style={{ color: mov.tipo === "entrada" ? "#1f9d55" : "#c0392b", fontSize: "13px" }}>
                      {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                    </td>
                    <td style={{ fontSize: "12px", color: "#6b7280" }}>{mov.observacion || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Movimientos;