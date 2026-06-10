import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../Supabase/SupabaseClient";

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
        <span style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-block" }}>
          ↑ +{variacion.toFixed(2)}%
        </span>
        {diff && <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 500 }}>{diff}</span>}
      </div>
    );
  }
  if (variacion < 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-block" }}>
          ↓ {variacion.toFixed(2)}%
        </span>
        {diff && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>{diff}</span>}
      </div>
    );
  }
  return (
    <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 500, display: "inline-block" }}>
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
    { label: "Total Registros", valor: historial.length, sublabel: "cambios registrados",   color: "#B89B6A", border: "#B89B6A" },
    { label: "Aumentos",        valor: aumentos,          sublabel: "precios incrementados", color: "#1f2937", border: "#9ca3af" },
    { label: "Reducciones",     valor: reducciones,       sublabel: "precios reducidos",     color: "#374151", border: "#ddd0b0" },
    { label: "Sin Cambio",      valor: sinCambio,         sublabel: "correcciones",          color: "#6b7280", border: "#e5e7eb" },
  ];

  return (
    <div className="p-5" style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Historial de Precios</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Rastrea y analiza todos los cambios de precios de productos</p>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="card shadow-sm rounded-4" style={{ padding: "18px 20px", border: `1.5px solid ${card.border}` }}>
            <small style={{ color: card.color, fontSize: "13px", fontWeight: "600" }}>{card.label}</small>
            <h3 style={{ fontSize: "26px", fontWeight: "bold", color: card.color, margin: "4px 0" }}>{card.valor}</h3>
            <small style={{ color: "#6b7280", fontSize: "12px" }}>{card.sublabel}</small>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Búsqueda y Filtros</h6>
        <div className="d-flex gap-3" style={{ flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar por ID o motivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
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
      <div className="card p-3 rounded-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#B89B6A" }}>Registro Histórico de Precios</h6>
          <small style={{ color: "#6b7280" }}>
            {filtrado.length} registro{filtrado.length !== 1 ? "s" : ""} encontrado{filtrado.length !== 1 ? "s" : ""}
          </small>
        </div>

        {cargando ? (
          <div className="text-center py-4" style={{ color: "#6b7280", fontSize: 13 }}>Cargando historial...</div>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                {["ID Historial", "Precio Anterior", "Precio Nuevo", "Variación", "Fecha Cambio", "Motivo"].map((col) => (
                  <th key={col} style={{ fontSize: 12, whiteSpace: "nowrap" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrado.map((h) => (
                <tr key={h.id_historial}>
                  <td style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{h.id_historial}</td>
                  <td style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{fmt(h.precio_anterior)}</td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{fmt(h.precio_nuevo)}</td>
                  <td><VariacionCell anterior={h.precio_anterior} nuevo={h.precio_nuevo} /></td>
                  <td style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{formatFecha(h.fecha_cambio)}</td>
                  <td style={{ fontSize: 13, color: "#6b7280", maxWidth: 220 }}>{h.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}