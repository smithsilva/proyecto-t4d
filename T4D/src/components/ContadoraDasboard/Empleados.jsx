import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../Supabase/SupabaseClient";
import {
  Search,
  Users,
  DollarSign,
  BadgeCheck,
  CalendarDays,
  Eye,
  X,
  Filter,
} from "lucide-react";

// =========================================
// PALETA (misma que Inventario)
// =========================================
const DORADO         = "#d4a743";
const DORADO_OSCURO   = "#8c6b3f";
const DORADO_CLARO    = "#e7c98a";
const FONDO            = "#f7f1e3";
const ENCABEZADO       = "#13202e"; // navy
const TEXTO_ENCABEZADO = "#e7c98a";

// =========================================
// UTILIDADES
// =========================================

const fmt = (n) =>
  "$ " + Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 });

function formatFecha(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre",
  ];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

// =========================================
// COMPONENTE PRINCIPAL
// =========================================

export default function Empleados() {

  const [empleados,   setEmpleados]   = useState([]);
  const [busqueda,    setBusqueda]    = useState("");
  const [verEmpleado, setVerEmpleado] = useState(null);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => { cargarEmpleados(); }, []);

  // ── CARGAR ───────────────────────────────
  const cargarEmpleados = async () => {
    setCargando(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .order("id_empleado", { ascending: true });

      if (error) throw error;
      setEmpleados(data || []);
    } catch (err) {
      console.error("Error al cargar empleados:", err.message);
      setError(err.message);
    }
    setCargando(false);
  };

  // ── FILTRO ───────────────────────────────
  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return empleados;
    return empleados.filter(
      (e) =>
        e.nombre_completo?.toLowerCase().includes(q) ||
        e.cargo?.toLowerCase().includes(q)
    );
  }, [empleados, busqueda]);

  // ── MÉTRICAS ─────────────────────────────
  const nominaMensual  = empleados.reduce((acc, e) => acc + Number(e.salario), 0);
  const salarioPromedio = empleados.length > 0
    ? Math.round(nominaMensual / empleados.length)
    : 0;

  const statCards = [
    { label: "Total Empleados",  valor: empleados.length,        sublabel: "personal activo",   color: DORADO,        border: DORADO,       Icon: Users },
    { label: "Nómina Mensual",   valor: fmt(nominaMensual),      sublabel: "costo total",        color: "#1a1a1a",     border: "#9ca3af",    Icon: DollarSign },
    { label: "Salario Promedio", valor: fmt(salarioPromedio),    sublabel: "por empleado",       color: DORADO_OSCURO, border: DORADO_CLARO, Icon: BadgeCheck },
  ];

  // ── RENDER ───────────────────────────────
  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* ENCABEZADO */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Gestión de Empleados{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              - Administra el personal de la empresa
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="rounded-4 shadow-sm"
            style={{ backgroundColor: "#fffdf8", padding: "18px 20px", border: `1.5px solid ${card.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <small style={{ color: card.color, fontSize: "13px", fontWeight: 600 }}>{card.label}</small>
              <h3 style={{ fontSize: "26px", fontWeight: "bold", color: card.color, margin: "4px 0" }}>{card.valor}</h3>
              <small style={{ color: "#6b7280", fontSize: "12px" }}>{card.sublabel}</small>
            </div>
            <card.Icon size={20} color={card.color} />
          </div>
        ))}
      </div>

      {/* BÚSQUEDA */}
      <div className="p-4 rounded-4 shadow-sm mb-4" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>
        <div style={{ position: "relative" }}>
          <Search size={16} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar por nombre o cargo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: "36px", paddingTop: "10px", paddingBottom: "10px" }}
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger rounded-4" style={{ fontSize: 13 }}>
          ⚠️ Error al conectar con la base de datos: <strong>{error}</strong>
        </div>
      )}

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        {cargando ? (
          <div className="text-center py-5 text-muted">Cargando empleados...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Users size={40} className="mb-2 opacity-50" />
            <p>No se encontraron empleados.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ minWidth: 900, backgroundColor: "#fffdf8" }}>
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["ID", "Cédula", "Nombre", "Cargo", "Tipo Contrato", "Salario", "F. Contratación", "F. Terminación", "Acciones"].map((h, i) => (
                    <th key={h} className={i === 0 ? "ps-3" : ""} style={{ backgroundColor: ENCABEZADO, color: TEXTO_ENCABEZADO, fontSize: "13px", border: "none", padding: "12px 8px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((e) => (
                  <tr key={e.id_empleado} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>

                    {/* ID */}
                    <td className="ps-3 fw-bold" style={{ fontSize: 13, color: DORADO_OSCURO }}>
                      #{e.id_empleado}
                    </td>

                    {/* Cédula */}
                    <td style={{ fontSize: 13, color: "#374151" }}>{e.cedula}</td>

                    {/* Nombre */}
                    <td style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{e.nombre_completo}</td>

                    {/* Cargo */}
                    <td>
                      <span style={{ background: "#f0ece4", color: "#374151", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600 }}>
                        {e.cargo}
                      </span>
                    </td>

                    {/* Tipo contrato */}
                    <td>
                      <span style={{ background: "#fdf3da", color: DORADO_OSCURO, borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 600, border: `1px solid ${DORADO_CLARO}` }}>
                        {e.tipo_contrato}
                      </span>
                    </td>

                    {/* Salario */}
                    <td style={{ fontWeight: 700, color: DORADO_OSCURO }}>{fmt(e.salario)}</td>

                    {/* F. Contratación */}
                    <td>
                      <div className="d-flex align-items-center gap-2" style={{ color: "#374151", fontSize: 13 }}>
                        <CalendarDays size={15} color="#6b7280" />
                        {formatFecha(e.fecha_contratacion)}
                      </div>
                    </td>

                    {/* F. Terminación */}
                    <td style={{ fontSize: 13, color: "#374151" }}>{formatFecha(e.fecha_terminacion)}</td>

                    {/* Acciones */}
                    <td>
                      <div className="d-flex justify-content-center">
                        <Eye
                          size={19}
                          style={{ cursor: "pointer", color: "#555" }}
                          onClick={() => setVerEmpleado(e)}
                        />
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL VER */}
      {verEmpleado && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={() => setVerEmpleado(null)}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, maxHeight: "90vh", overflowY: "auto", position: "relative" }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <button
              onClick={() => setVerEmpleado(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X size={18} />
            </button>

            <h5 className="fw-bold mb-1">Detalle del Empleado</h5>
            <div style={{ width: 40, height: 3, background: DORADO, borderRadius: 10, marginBottom: 20 }} />

            {[
              ["ID",                  `#${verEmpleado.id_empleado}`],
              ["Cédula",              verEmpleado.cedula],
              ["Nombre Completo",     verEmpleado.nombre_completo],
              ["Cargo",               verEmpleado.cargo],
              ["Tipo de Contrato",    verEmpleado.tipo_contrato?.replace(/_/g, " ")],
              ["Salario",             fmt(verEmpleado.salario)],
              ["Fecha Contratación",  formatFecha(verEmpleado.fecha_contratacion)],
              ["Fecha Terminación",   formatFecha(verEmpleado.fecha_terminacion)],
            ].map(([label, valor]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "#111827", fontWeight: 600 }}>{valor}</span>
              </div>
            ))}

            <button
              onClick={() => setVerEmpleado(null)}
              className="btn btn-secondary w-100 mt-3"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}