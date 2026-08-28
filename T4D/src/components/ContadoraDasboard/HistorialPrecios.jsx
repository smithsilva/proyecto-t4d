import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../Supabase/SupabaseClient";
import { Filter, Search, Pencil, X, Eye, Trash2, ToggleLeft } from "lucide-react";

const DORADO          = "#d4a743";
const DORADO_OSCURO   = "#8c6b3f";
const DORADO_CLARO    = "#e7c98a";
const FONDO           = "#f7f1e3";
const ENCABEZADO      = "#13202e";
const TEXTO_ENCABEZADO = "#e7c98a";
const BTN_GRAD        = "linear-gradient(135deg, #c9941f, #8c6b3f)";

// ─── PERMISOS POR ROL ─────────────────────────────────────────────────────────
// admin     → ver, editar precio, eliminar registro historial, desactivar producto
// gerente   → ver, editar precio
// contadora → solo ver
const permisos = {
  admin:     { editar: true,  eliminar: true,  desactivar: true  },
  gerente:   { editar: true,  eliminar: false, desactivar: false },
  contadora: { editar: false, eliminar: false, desactivar: false },
};

const fmt = (n) =>
  "$ " + Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 });

function getVariacion(anterior, nuevo) {
  if (anterior === 0) return 0;
  return ((nuevo - anterior) / anterior) * 100;
}

function calcDiff(anterior, nuevo) {
  const diff = nuevo - anterior;
  if (diff === 0) return null;
  return `${diff > 0 ? "+" : "-"}$ ${Math.abs(diff).toLocaleString("es-CO")}`;
}

function formatFecha(datetime) {
  if (!datetime) return "—";
  const fecha = new Date(datetime);
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

function VariacionCell({ anterior, nuevo }) {
  const v = getVariacion(anterior, nuevo);
  const d = calcDiff(anterior, nuevo);
  if (v > 0) return (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <span style={{ background:"#fbe2df", color:"#c0392b", borderRadius:999, padding:"2px 8px", fontSize:11, fontWeight:600, display:"inline-block" }}>↑ +{v.toFixed(2)}%</span>
      {d && <span style={{ fontSize:12, color:"#c0392b", fontWeight:500 }}>{d}</span>}
    </div>
  );
  if (v < 0) return (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <span style={{ background:"#e3f7e9", color:"#1f9d55", borderRadius:999, padding:"2px 8px", fontSize:11, fontWeight:600, display:"inline-block" }}>↓ {v.toFixed(2)}%</span>
      {d && <span style={{ fontSize:12, color:"#1f9d55", fontWeight:500 }}>{d}</span>}
    </div>
  );
  return <span style={{ background:"#f0ece4", color:"#6b7280", borderRadius:999, padding:"2px 10px", fontSize:11, fontWeight:500, display:"inline-block" }}>= Sin cambio</span>;
}

const inputStyle = { width:"100%", padding:"9px 12px", marginBottom:12, borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:13, outline:"none", background:"#fafafa", color:"#111827" };
const labelStyle = { fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:4 };

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
// Uso: <HistorialPrecios usuario={usuario} />
// usuario viene de localStorage: { rol: "admin" | "gerente" | "contadora", ... }
export default function HistorialPrecios({ usuario }) {
  const rol    = usuario?.rol?.toLowerCase().trim() ?? "contadora";
  const puede  = permisos[rol] ?? permisos.contadora;

  const [historial,   setHistorial]   = useState([]);
  const [productos,   setProductos]   = useState([]);
  const [busqueda,    setBusqueda]    = useState("");
  const [fecha,       setFecha]       = useState("");
  const [cargando,    setCargando]    = useState(true);
  const [modalVer,    setModalVer]    = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [productoSel, setProductoSel] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [motivo,      setMotivo]      = useState("");
  const [guardando,   setGuardando]   = useState(false);

  useEffect(() => { cargarTodo(); }, []);

  const cargarTodo = async () => {
    setCargando(true);
    const [{ data: hist }, { data: prods }] = await Promise.all([
      supabase.from("historial_precios").select("*").order("id_historial", { ascending: false }),
      supabase.from("productos").select("id_producto, nombre_producto, precio_actual, activo").order("nombre_producto"),
    ]);
    setHistorial(hist || []);
    setProductos(prods || []);
    setCargando(false);
  };

  const productosMap = useMemo(() =>
    Object.fromEntries((productos || []).map((p) => [p.id_producto, p])),
    [productos]
  );

  const filtrado = useMemo(() => {
    const q = busqueda.toLowerCase();
    return historial.filter((h) => {
      const nombre = productosMap[h.id_producto]?.nombre_producto || "";
      const matchQ = !q ||
        String(h.id_historial).includes(q) ||
        h.motivo?.toLowerCase().includes(q) ||
        nombre.toLowerCase().includes(q);
      const matchF = !fecha || h.fecha_cambio?.startsWith(fecha);
      return matchQ && matchF;
    });
  }, [historial, busqueda, fecha, productosMap]);

  const aumentos    = historial.filter((h) => getVariacion(h.precio_anterior, h.precio_nuevo) > 0).length;
  const reducciones = historial.filter((h) => getVariacion(h.precio_anterior, h.precio_nuevo) < 0).length;
  const sinCambio   = historial.filter((h) => getVariacion(h.precio_anterior, h.precio_nuevo) === 0).length;

  const statCards = [
    { label:"Total Registros", valor:historial.length, sublabel:"cambios registrados",   color:DORADO,        border:DORADO       },
    { label:"Aumentos",        valor:aumentos,          sublabel:"precios incrementados", color:"#c0392b",     border:"#9ca3af"    },
    { label:"Reducciones",     valor:reducciones,       sublabel:"precios reducidos",     color:DORADO_OSCURO, border:DORADO_CLARO },
    { label:"Sin Cambio",      valor:sinCambio,         sublabel:"sin variación",         color:"#6b7280",     border:"#e5e7eb"    },
  ];

  // ── Guardar precio ─────────────────────────────────────────────────────────
  const guardarPrecio = async () => {
    if (!productoSel) return;
    const precioAnterior = Number(productoSel.precio_actual);
    const precioNuevo    = Number(nuevoPrecio);
    if (!nuevoPrecio || isNaN(precioNuevo) || precioNuevo <= 0) { alert("Ingresa un precio válido."); return; }
    if (!motivo.trim()) { alert("El motivo es obligatorio."); return; }
    setGuardando(true);
    const { error } = await supabase.from("productos").update({ precio_actual: precioNuevo }).eq("id_producto", productoSel.id_producto);
    if (error) { alert("No se pudo actualizar el precio."); setGuardando(false); return; }
    await supabase.from("historial_precios").insert([{
      id_producto: productoSel.id_producto, precio_anterior: precioAnterior,
      precio_nuevo: precioNuevo, motivo: motivo.trim(), fecha_cambio: new Date().toISOString(),
    }]);
    setGuardando(false);
    setModalEditar(false);
    setProductoSel(null);
    cargarTodo();
  };

  // ── Eliminar registro ──────────────────────────────────────────────────────
  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Eliminar este registro del historial? Esta acción no se puede deshacer.")) return;
    await supabase.from("historial_precios").delete().eq("id_historial", id);
    setHistorial((prev) => prev.filter((h) => h.id_historial !== id));
  };

  // ── Activar / Desactivar producto ──────────────────────────────────────────
  const toggleProducto = async (idProducto, activo) => {
    const accion = activo ? "desactivar" : "activar";
    if (!window.confirm(`¿Deseas ${accion} este producto en el inventario?`)) return;
    await supabase.from("productos").update({ activo: !activo }).eq("id_producto", idProducto);
    setProductos((prev) => prev.map((p) => p.id_producto === idProducto ? { ...p, activo: !activo } : p));
  };

  return (
    <div className="p-4" style={{ margin:0, backgroundColor:FONDO, minHeight:"100vh", width:"100%" }}>

      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor:"#fffdf8", border:`1px solid ${DORADO_CLARO}`, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
        <div>
          <h4 className="fw-bold mb-2" style={{ color:"#1a1a1a" }}>
            Historial de Precios{" "}
            <span className="fw-normal text-muted" style={{ fontSize:"16px" }}>- Rastrea y analiza cambios de precios</span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap:"10px" }}>
            <span style={{ height:"2px", width:"70px", background:`linear-gradient(to right, transparent, ${DORADO})`, display:"inline-block" }} />
            <span style={{ color:DORADO, fontSize:"14px" }}>★</span>
            <span style={{ height:"2px", width:"70px", background:`linear-gradient(to left, transparent, ${DORADO})`, display:"inline-block" }} />
          </div>
        </div>

        {puede.editar && (
          <button className="btn d-flex align-items-center gap-2 fw-semibold"
            onClick={() => { setProductoSel(null); setNuevoPrecio(""); setMotivo(""); setModalEditar(true); }}
            style={{ background:BTN_GRAD, color:"#fff", borderRadius:"8px", padding:"8px 18px 8px 8px", border:"none", boxShadow:"0 3px 12px rgba(140,107,63,0.55)" }}>
            <span className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width:"24px", height:"24px", backgroundColor:"rgba(255,255,255,0.25)" }}>
              <Pencil size={14} />
            </span>
            Editar Precio
          </button>
        )}
      </div>

      {/* STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="rounded-4 shadow-sm"
            style={{ backgroundColor:"#fffdf8", padding:"18px 20px", border:`1.5px solid ${card.border}` }}>
            <small style={{ color:card.color, fontSize:"13px", fontWeight:600 }}>{card.label}</small>
            <h3 style={{ fontSize:"26px", fontWeight:"bold", color:card.color, margin:"4px 0" }}>{card.valor}</h3>
            <small style={{ color:"#6b7280", fontSize:"12px" }}>{card.sublabel}</small>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="p-4 rounded-4 shadow-sm mb-4" style={{ backgroundColor:"#fffdf8", border:`1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color:"#1a1a1a", fontSize:"16px" }}>Búsqueda y Filtros</h6>
        </div>
        <div className="d-flex gap-3" style={{ flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:"1 1 250px" }}>
            <Search size={16} color="#999" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }} />
            <input type="text" className="form-control rounded-pill"
              placeholder="Buscar por producto, ID o motivo..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft:"36px", paddingTop:"10px", paddingBottom:"10px" }} />
          </div>
          <input type="date" className="form-control rounded-pill"
            style={{ maxWidth:200 }} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor:"#fffdf8", border:`1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
          <h6 className="fw-bold mb-0" style={{ color:"#1a1a1a" }}>Registro Histórico de Precios</h6>
          <small style={{ color:"#6b7280" }}>{filtrado.length} registro{filtrado.length !== 1 ? "s" : ""} encontrado{filtrado.length !== 1 ? "s" : ""}</small>
        </div>

        {cargando ? (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ display:"inline-block", width:28, height:28, border:`3px solid ${DORADO_CLARO}`, borderTop:`3px solid ${DORADO_OSCURO}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <p style={{ marginTop:12, color:"#9ca3af", fontSize:13 }}>Cargando historial...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ backgroundColor:"#fffdf8" }}>
              <thead>
                <tr style={{ backgroundColor:ENCABEZADO }}>
                  {["ID", "Producto", "Precio Anterior", "Precio Nuevo", "Variación", "Fecha", "Motivo", "Acciones"].map((col, i) => (
                    <th key={col} className={i === 0 ? "ps-3" : i === 7 ? "text-center" : ""}
                      style={{ backgroundColor:ENCABEZADO, color:TEXTO_ENCABEZADO, fontSize:"13px", whiteSpace:"nowrap", border:"none", padding:"12px 8px" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrado.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-5" style={{ fontSize:13, color:"#9ca3af" }}>No hay registros para los filtros aplicados.</td></tr>
                ) : filtrado.map((h) => {
                  const prod = productosMap[h.id_producto];
                  return (
                    <tr key={h.id_historial} style={{ borderBottom:"1px solid #ece4d3", backgroundColor:"#fffdf8" }}>
                      <td className="ps-3 fw-bold" style={{ fontSize:13, color:DORADO_OSCURO }}>#{h.id_historial}</td>
                      <td style={{ fontSize:13 }}>
                        {prod ? (
                          <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                            <span style={{ fontWeight:600, color:"#1a1a1a" }}>{prod.nombre_producto}</span>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <span style={{ fontSize:11, color:"#6b7280" }}>ID: {h.id_producto} · Actual: {fmt(prod.precio_actual)}</span>
                              {/* Badge activo/inactivo */}
                              <span style={{ fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:999,
                                background: prod.activo ? "#e3f7e9" : "#fbe2df",
                                color:      prod.activo ? "#1f9d55" : "#c0392b" }}>
                                {prod.activo ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          </div>
                        ) : <span style={{ color:"#9ca3af", fontSize:12 }}>ID: {h.id_producto}</span>}
                      </td>
                      <td style={{ whiteSpace:"nowrap" }}>
                        <span style={{ backgroundColor:"#fdf3da", color:"#b8860b", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:12, display:"inline-block" }}>
                          {fmt(h.precio_anterior)}
                        </span>
                      </td>
                      <td style={{ whiteSpace:"nowrap" }}>
                        <span style={{ backgroundColor:"#e3f7e9", color:"#1f9d55", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:12, display:"inline-block" }}>
                          {fmt(h.precio_nuevo)}
                        </span>
                      </td>
                      <td><VariacionCell anterior={h.precio_anterior} nuevo={h.precio_nuevo} /></td>
                      <td style={{ fontSize:13, color:"#374151", whiteSpace:"nowrap" }}>{formatFecha(h.fecha_cambio)}</td>
                      <td style={{ fontSize:13, color:"#6b7280", maxWidth:200 }}>{h.motivo}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          {/* VER — todos */}
                          <button title="Ver detalle" onClick={() => setModalVer(h)}
                            style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                            <Eye size={17} color="#555" />
                          </button>

                          {/* EDITAR PRECIO — admin y gerente */}
                          {puede.editar && prod && (
                            <button title="Editar precio" onClick={() => {
                              setProductoSel(prod);
                              setNuevoPrecio(prod.precio_actual);
                              setMotivo("");
                              setModalEditar(true);
                            }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                              <Pencil size={17} color={DORADO_OSCURO} />
                            </button>
                          )}

                          {/* DESACTIVAR / ACTIVAR — solo admin */}
                          {puede.desactivar && prod && (
                            <button title={prod.activo ? "Desactivar producto" : "Activar producto"}
                              onClick={() => toggleProducto(prod.id_producto, prod.activo)}
                              style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                              <ToggleLeft size={17} color={prod.activo ? "#1f9d55" : "#9ca3af"} />
                            </button>
                          )}

                          {/* ELIMINAR HISTORIAL — solo admin */}
                          {puede.eliminar && (
                            <button title="Eliminar registro del historial"
                              onClick={() => eliminarRegistro(h.id_historial)}
                              style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                              <Trash2 size={17} color="#c0392b" />
                            </button>
                          )}
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

      {/* ── MODAL VER ─────────────────────────────────────────────────────────── */}
      {modalVer && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background:"rgba(0,0,0,0.5)", zIndex:1050 }} onClick={() => setModalVer(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width:380, maxHeight:"90vh", overflowY:"auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Detalle del Registro</h5>
              <X size={20} style={{ cursor:"pointer" }} onClick={() => setModalVer(null)} />
            </div>
            <div style={{ width:40, height:3, backgroundColor:DORADO_OSCURO, borderRadius:4, marginBottom:18 }} />
            {[
              ["ID Historial",    `#${modalVer.id_historial}`],
              ["Producto",        productosMap[modalVer.id_producto]?.nombre_producto ?? `ID ${modalVer.id_producto}`],
              ["Precio anterior", fmt(modalVer.precio_anterior)],
              ["Precio nuevo",    fmt(modalVer.precio_nuevo)],
              ["Variación",       `${getVariacion(modalVer.precio_anterior, modalVer.precio_nuevo).toFixed(2)}%`],
              ["Fecha",           formatFecha(modalVer.fecha_cambio)],
              ["Motivo",          modalVer.motivo],
            ].map(([lbl, val]) => (
              <p key={lbl} className="mb-2" style={{ fontSize:13 }}>
                <strong style={{ color:DORADO_OSCURO }}>{lbl}:</strong>{" "}{val}
              </p>
            ))}
            <button className="btn btn-secondary w-100 mt-2" onClick={() => setModalVer(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR PRECIO ───────────────────────────────────────────────── */}
      {modalEditar && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background:"rgba(0,0,0,0.5)", zIndex:1050 }}
          onClick={() => { setModalEditar(false); setProductoSel(null); }}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width:440, maxHeight:"90vh", overflowY:"auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h5 className="fw-bold mb-0">Editar Precio de Producto</h5>
              <X size={20} style={{ cursor:"pointer" }} onClick={() => { setModalEditar(false); setProductoSel(null); }} />
            </div>
            <div style={{ width:40, height:3, backgroundColor:DORADO_OSCURO, borderRadius:4, marginBottom:18 }} />

            <label style={labelStyle}>Selecciona el producto *</label>
            <select style={inputStyle} value={productoSel?.id_producto || ""}
              onChange={(e) => {
                const p = productos.find(p => p.id_producto === parseInt(e.target.value));
                setProductoSel(p || null);
                setNuevoPrecio(p?.precio_actual ?? "");
              }}>
              <option value="">— Elige un producto —</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre_producto} — actual: {fmt(p.precio_actual)}
                </option>
              ))}
            </select>

            {productoSel && (
              <>
                <label style={labelStyle}>Precio actual</label>
                <input type="text" style={{ ...inputStyle, background:"#f0ece4", color:"#6b7280" }}
                  value={fmt(productoSel.precio_actual)} readOnly />
              </>
            )}

            <label style={labelStyle}>Nuevo precio *</label>
            <input type="number" min="0" style={inputStyle} placeholder="Ej: 5500"
              value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} />

            <label style={labelStyle}>Motivo del cambio *</label>
            <textarea rows={3} style={{ ...inputStyle, resize:"vertical" }}
              placeholder="Ej: Ajuste por inflación"
              value={motivo} onChange={(e) => setMotivo(e.target.value)} />

            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-secondary flex-fill" disabled={guardando}
                onClick={() => { setModalEditar(false); setProductoSel(null); }}>Cancelar</button>
              <button className="btn flex-fill fw-semibold" disabled={guardando || !productoSel}
                onClick={guardarPrecio}
                style={{ background:BTN_GRAD, color:"#fff", border:"none" }}>
                {guardando ? "Guardando..." : "Guardar Cambio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}