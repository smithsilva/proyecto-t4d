import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../Supabase/SupabaseClient";
import { Filter, Search, History } from "lucide-react";

// =========================================
// PALETA (misma que Inventario)
// =========================================
const DORADO         = "#d4a743";
const DORADO_OSCURO   = "#8c6b3f";
const DORADO_CLARO    = "#e7c98a";
const FONDO            = "#f7f1e3";
const ENCABEZADO       = "#13202e"; // navy
const TEXTO_ENCABEZADO = "#e7c98a";

// Formateador de moneda colombiana (COP)
const fmt = (n) =>
  "$ " + Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 });

// Función para calcular el porcentaje de variación de forma dinámica
function getVariacion(anterior, nuevo) {
  if (anterior === 0) return 0;
  return ((nuevo - anterior) / anterior) * 100;
}

// Función para calcular la diferencia absoluta con signo
function calcDiff(anterior, nuevo) {
  const diff = nuevo - anterior;
  if (diff === 0) return null;
  const sign = diff > 0 ? "+" : "-";
  return `${sign}$ ${Math.abs(diff).toLocaleString("es-CO")}`;
}

// Componente para renderizar la celda de variación con sus estilos visuales
function VariacionCell({ anterior, nuevo }) {
  const variacion = getVariacion(anterior, nuevo);
  const diff = calcDiff(anterior, nuevo);

  if (variacion > 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ background: "#fbe2df", color: "#c0392b", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-block" }}>
          ↑ +{variacion.toFixed(2)}%
        </span>
        {diff && <span style={{ fontSize: 12, color: "#c0392b", fontWeight: 500 }}>{diff}</span>}
      </div>
    );
  }
  if (variacion < 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ background: "#e3f7e9", color: "#1f9d55", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-block" }}>
          ↓ {variacion.toFixed(2)}%
        </span>
        {diff && <span style={{ fontSize: 12, color: "#1f9d55", fontWeight: 500 }}>{diff}</span>}
      </div>
    );
  }
  return (
    <span style={{ background: "#f0ece4", color: "#6b7280", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 500, display: "inline-block" }}>
      = Sin cambio
    </span>
  );
}

// Formateador de fechas a un formato legible (ej: 8 de mayo de 2026)
function formatFecha(datetime) {
  if (!datetime) return "—";
  const fecha = new Date(datetime);
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

export default function HistorialPrecios() {
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [fecha, setFecha] = useState("");
  const [cargando, setCargando] = useState(true);

  // Carga inicial de datos desde Supabase
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from("historial_precios")
        .select("*")
        .order("id_historial", { ascending: false });
      if (error) throw error;
      setHistorial(data || []);
    } catch (err) {
      console.error("Error al cargar historial:", err.message);
    }
    setCargando(false);
  };

  // Filtrado de registros en base a la búsqueda (ID o motivo) y fecha
  const filtrado = useMemo(() => {
    const q = busqueda.toLowerCase();
    return historial.filter((h) => {
      const matchQ = !q ||
        String(h.id_historial).toLowerCase().includes(q) ||
        h.motivo?.toLowerCase().includes(q);
      const matchFecha = !fecha || h.fecha_cambio?.startsWith(fecha);
      return matchQ && matchFecha;
    });
  }, [historial, busqueda, fecha]);

  // Contadores dinámicos para las tarjetas de estadísticas
  const aumentos   = historial.filter((h) => getVariacion(h.precio_anterior, h.precio_nuevo) > 0).length;
  const reducciones = historial.filter((h) => getVariacion(h.precio_anterior, h.precio_nuevo) < 0).length;
  const sinCambio  = historial.filter((h) => getVariacion(h.precio_anterior, h.precio_nuevo) === 0).length;

  const statCards = [
    { label: "Total Registros", valor: historial.length, sublabel: "cambios registrados",   color: DORADO,        border: DORADO,       Icon: History },
    { label: "Aumentos",        valor: aumentos,          sublabel: "precios incrementados", color: "#1a1a1a",     border: "#9ca3af",    Icon: History },
    { label: "Reducciones",     valor: reducciones,       sublabel: "precios reducidos",     color: DORADO_OSCURO, border: DORADO_CLARO, Icon: History },
    { label: "Sin Cambio",      valor: sinCambio,         sublabel: "correcciones",          color: "#6b7280",     border: "#e5e7eb",    Icon: History },
  ];

  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* ENCABEZADO */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Historial de Precios{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              - Rastrea y analiza todos los cambios de precios de productos
            </span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="rounded-4 shadow-sm"
            style={{ backgroundColor: "#fffdf8", padding: "18px 20px", border: `1.5px solid ${card.border}` }}>
            <small style={{ color: card.color, fontSize: "13px", fontWeight: 600 }}>{card.label}</small>
            <h3 style={{ fontSize: "26px", fontWeight: "bold", color: card.color, margin: "4px 0" }}>{card.valor}</h3>
            <small style={{ color: "#6b7280", fontSize: "12px" }}>{card.sublabel}</small>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="p-4 rounded-4 shadow-sm mb-4" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Búsqueda y Filtros</h6>
        </div>
        <div className="d-flex gap-3" style={{ flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 250px" }}>
            <Search size={16} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Buscar por ID o motivo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: "36px", paddingTop: "10px", paddingBottom: "10px" }}
            />
          </div>
          <input
            type="date"
            className="form-control rounded-pill"
            style={{ maxWidth: 200 }}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Registro Histórico de Precios</h6>
          <small style={{ color: "#6b7280" }}>
            {filtrado.length} registro{filtrado.length !== 1 ? "s" : ""} encontrado{filtrado.length !== 1 ? "s" : ""}
          </small>
        </div>

        {cargando ? (
          <div className="text-center py-5 text-muted">Cargando historial...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ backgroundColor: "#fffdf8" }}>
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["ID Historial", "Precio Anterior", "Precio Nuevo", "Variación", "Fecha Cambio", "Motivo"].map((col, i) => (
                    <th key={col} className={i === 0 ? "ps-3" : ""} style={{ backgroundColor: ENCABEZADO, color: TEXTO_ENCABEZADO, fontSize: "13px", whiteSpace: "nowrap", border: "none", padding: "12px 8px" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrado.map((h) => (
                  <tr key={h.id_historial} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                    <td className="ps-3 fw-bold" style={{ fontSize: 13, color: DORADO_OSCURO }}>#{h.id_historial}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ backgroundColor: "#fdf3da", color: "#b8860b", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 12, display: "inline-block" }}>
                        {fmt(h.precio_anterior)}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ backgroundColor: "#e3f7e9", color: "#1f9d55", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 12, display: "inline-block" }}>
                        {fmt(h.precio_nuevo)}
                      </span>
                    </td>
                    <td><VariacionCell anterior={h.precio_anterior} nuevo={h.precio_nuevo} /></td>
                    <td style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{formatFecha(h.fecha_cambio)}</td>
                    <td style={{ fontSize: 13, color: "#6b7280", maxWidth: 220 }}>{h.motivo}</td>
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