import { useState, useMemo, useEffect } from "react";
import {
  Eye, CreditCard, CheckCircle, XCircle,
  Banknote, Building2, X, Filter, Search, Link,
} from "lucide-react";
import { supabase } from "../../supabase/supabaseClient";

const DORADO          = "#d4a743";
const DORADO_OSCURO   = "#8c6b3f";
const DORADO_CLARO    = "#e7c98a";
const FONDO           = "#f7f1e3";
const ENCABEZADO      = "#13202e";
const TEXTO_ENCABEZADO = "#e7c98a";

function TipoIcono({ tipo }) {
  const iconProps = { size: 16, strokeWidth: 1.8 };
  if (tipo === "Efectivo") return <Banknote {...iconProps} />;
  if (tipo === "Tarjeta")  return <CreditCard {...iconProps} />;
  return <Building2 {...iconProps} />;
}

const inferirTipo = (nombre) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("efectivo"))                                                   return "Efectivo";
  if (n.includes("tarjeta") || n.includes("débito") || n.includes("debito"))   return "Tarjeta";
  return "Transferencia";
};

const fmtFecha = (f) => {
  if (!f) return "—";
  const [y, m, d] = f.split("-");
  return `${d}/${m}/${y}`;
};

export default function MetodosPago() {
  const [metodos, setMetodos]           = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [busqueda, setBusqueda]         = useState("");
  const [tipoFiltro, setTipoFiltro]     = useState("");
  const [verMetodo, setVerMetodo]       = useState(null);

  // ─── CARGAR ───────────────────────────────────────────────
  const cargarMetodos = async () => {
    setCargando(true);

    const [{ data: metData }, { data: asgData }] = await Promise.all([
      supabase.from("metodos_pago").select("*").order("id_metodo_pago", { ascending: true }),
      supabase
        .from("asignaciones_tareas")
        .select("id_asignacion, vehiculo, tipo_trabajo, estado, prioridad, fecha_limite, costo, id_metodo_pago")
        .not("id_metodo_pago", "is", null),
    ]);

    setMetodos(
      (metData || []).map((m) => ({
        ...m,
        tipo: inferirTipo(m.nombre_metodo),
      }))
    );
    setAsignaciones(asgData || []);
    setCargando(false);
  };

  useEffect(() => { cargarMetodos(); }, []);

  // ─── CONTEO por método ────────────────────────────────────
  const conteoAsignaciones = useMemo(() => {
    const map = {};
    asignaciones.forEach((a) => {
      map[a.id_metodo_pago] = (map[a.id_metodo_pago] || 0) + 1;
    });
    return map;
  }, [asignaciones]);

  const asignacionesDe = (idMetodo) =>
    asignaciones.filter((a) => a.id_metodo_pago === idMetodo);

  // ─── FILTROS ──────────────────────────────────────────────
  const metodosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return metodos.filter(
      (m) =>
        (m.nombre_metodo?.toLowerCase().includes(q) || String(m.id_metodo_pago).includes(q)) &&
        (tipoFiltro === "" || m.tipo === tipoFiltro)
    );
  }, [metodos, busqueda, tipoFiltro]);

  const totalAsignaciones = asignaciones.length;
  const statCards = [
    { label: "Total Métodos",      valor: metodos.length,    sublabel: "métodos configurados",         color: DORADO,        border: DORADO,       Icon: CreditCard  },
    { label: "Activos",            valor: metodos.length,    sublabel: "disponibles para uso",         color: "#1a1a1a",     border: "#9ca3af",    Icon: CheckCircle },
    { label: "Inactivos",          valor: 0,                 sublabel: "temporalmente deshabilitados", color: DORADO_OSCURO, border: DORADO_CLARO, Icon: XCircle     },
    { label: "Total Asignaciones", valor: totalAsignaciones, sublabel: "vinculadas a un método",       color: "#185FA5",     border: "#85B7EB",    Icon: Link        },
  ];

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Métodos de Pago{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              - Gestiona las formas de pago aceptadas por la empresa
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

      {/* FILTROS */}
      <div className="p-4 rounded-4 shadow-sm mb-4" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Búsqueda y Filtros</h6>
        </div>
        <div className="d-flex gap-3" style={{ flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 250px" }}>
            <Search size={16} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input type="text" className="form-control rounded-pill" placeholder="Buscar por nombre o ID..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: "36px", paddingTop: "10px", paddingBottom: "10px" }} />
          </div>
          <select className="form-select rounded-pill" style={{ maxWidth: 200 }}
            value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Métodos de Pago Registrados</h6>
          <small style={{ color: "#6b7280" }}>
            {metodosFiltrados.length} método{metodosFiltrados.length !== 1 ? "s" : ""} encontrado{metodosFiltrados.length !== 1 ? "s" : ""}
          </small>
        </div>

        {cargando ? (
          <div className="text-center py-5 text-muted">Cargando métodos de pago...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ backgroundColor: "#fffdf8" }}>
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["ID", "Nombre", "Tipo", "Online", "Descripción", "Asignaciones", "Acciones"].map((col, i) => (
                    <th key={col} className={i === 0 ? "ps-3" : ""}
                      style={{ backgroundColor: ENCABEZADO, color: TEXTO_ENCABEZADO, fontSize: "13px", border: "none", padding: "12px 8px" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metodosFiltrados.map((m) => {
                  const count = conteoAsignaciones[m.id_metodo_pago] || 0;
                  return (
                    <tr key={m.id_metodo_pago} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                      <td className="ps-3 fw-bold" style={{ fontSize: 13, color: DORADO_OSCURO }}>#{m.id_metodo_pago}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ background: "#f0ece4", borderRadius: 6, padding: "5px 6px", display: "inline-flex", color: DORADO_OSCURO }}>
                            <TipoIcono tipo={m.tipo} />
                          </span>
                          <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{m.nombre_metodo}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "#f0ece4", color: "#374151", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{m.tipo}</span>
                      </td>
                      <td>
                        <span style={{
                          background: m.permite_online ? "#e3f7e9" : "#fbe2df",
                          color: m.permite_online ? "#1f9d55" : "#c0392b",
                          padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                        }}>
                          {m.permite_online ? "Sí" : "No"}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>{m.descripcion || "—"}</td>
                      <td>
                        <span
                          onClick={() => count > 0 && setVerMetodo({ ...m, verAsignaciones: true })}
                          style={{
                            background: count > 0 ? "#e6f1fb" : "#f3f4f6",
                            color:      count > 0 ? "#185FA5" : "#9ca3af",
                            padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                            cursor: count > 0 ? "pointer" : "default",
                            display: "inline-flex", alignItems: "center", gap: 4,
                          }}
                          title={count > 0 ? "Ver asignaciones" : "Sin asignaciones"}
                        >
                          <Link size={11} />
                          {count} asignación{count !== 1 ? "es" : ""}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center">
                          <Eye size={19} style={{ cursor: "pointer", color: "#555" }} onClick={() => setVerMetodo({ ...m, verAsignaciones: false })} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL VER */}
      {verMetodo && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setVerMetodo(null)}>
          <div className="bg-white p-4 rounded-4 shadow"
            style={{ width: 480, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVerMetodo(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={18} />
            </button>
            <h5 className="fw-bold mb-1">Detalle del Método</h5>
            <div style={{ width: 40, height: 3, background: DORADO, borderRadius: 10, marginBottom: 20 }} />

            <div className="d-flex justify-content-center mb-3">
              <div style={{ background: "#f0ece4", borderRadius: 16, padding: "18px 22px", color: DORADO_OSCURO }}>
                <TipoIcono tipo={verMetodo.tipo} />
              </div>
            </div>

            {[
              ["ID",             `#${verMetodo.id_metodo_pago}`],
              ["Nombre",         verMetodo.nombre_metodo],
              ["Tipo",           verMetodo.tipo],
              ["Descripción",    verMetodo.descripcion || "—"],
              ["Permite online", verMetodo.permite_online ? "Sí" : "No"],
            ].map(([key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>{key}</span>
                <span style={{ color: "#111827", fontWeight: 600 }}>{val}</span>
              </div>
            ))}

            {/* ASIGNACIONES VINCULADAS */}
            <div style={{ marginTop: 20 }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Link size={14} color={DORADO_OSCURO} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                  Asignaciones vinculadas ({asignacionesDe(verMetodo.id_metodo_pago).length})
                </span>
              </div>

              {asignacionesDe(verMetodo.id_metodo_pago).length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#9ca3af", fontSize: 12 }}>
                  Este método no tiene asignaciones aún.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {asignacionesDe(verMetodo.id_metodo_pago).map((a) => (
                    <div key={a.id_asignacion}
                      style={{ background: "#faf7f2", border: "1px solid #e8dcc8", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: DORADO_OSCURO }}>#{a.id_asignacion} — {a.vehiculo}</span>
                        <span style={{
                          background: a.estado === "Finalizada" ? "#EAF3DE" : a.estado === "En proceso" ? "#e6f1fb" : "#f3f4f6",
                          color:      a.estado === "Finalizada" ? "#3B6D11"  : a.estado === "En proceso" ? "#185FA5"  : "#374151",
                          padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600,
                        }}>
                          {a.estado}
                        </span>
                      </div>
                      <div style={{ color: "#6b7280", display: "flex", gap: 16 }}>
                        <span>{a.tipo_trabajo}</span>
                        <span>Vence: {fmtFecha(a.fecha_limite)}</span>
                        {a.costo && <span style={{ color: DORADO_OSCURO, fontWeight: 600 }}>${parseFloat(a.costo).toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setVerMetodo(null)} className="btn btn-secondary w-100 mt-3">Cerrar</button>
          </div>
        </div>
      )}

    </div>
  );
}