import { useState, useEffect } from "react";
import { Eye, Package, X, Plus, Filter, Search, Trash2, Pencil } from "lucide-react";
import { supabase } from "../../supabase/supabaseClient";

function Inventario({ usuario }) {
  const [busqueda,        setBusqueda]        = useState("");
  const [filtroEstado,    setFiltroEstado]    = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroRol,       setFiltroRol]       = useState("todos");
  const [filtroUnidad,    setFiltroUnidad]    = useState("todas");
  const [filtroProveedor, setFiltroProveedor] = useState("todos");
  const [productos,       setProductos]       = useState([]);
  const [categorias,      setCategorias]      = useState([]);
  const [proveedores,     setProveedores]     = useState([]);
  const [verProducto,     setVerProducto]     = useState(null);
  const [editarProducto,  setEditarProducto]  = useState(null);
  const [formEdit,        setFormEdit]        = useState({});
  const [guardando,       setGuardando]       = useState(false);
  const [cargando,        setCargando]        = useState(false);
  const [mostrarCrear,    setMostrarCrear]    = useState(false);
  const [formNuevo,       setFormNuevo]       = useState({
    nombre_producto: "",
    descripcion:     "",
    precio_actual:   "",
    stock_actual:    "",
    unidad_medida:   "",
    codigo_barras:   "",
    id_categoria:    "",
    id_proveedor:    "",
  });
  const [creando, setCreando] = useState(false);

  const DORADO           = "#d4a743";
  const DORADO_OSCURO    = "#8c6b3f";
  const DORADO_CLARO     = "#e7c98a";
  const FONDO            = "#f7f1e3";
  const ENCABEZADO       = "#13202e";
  const TEXTO_ENCABEZADO = "#e7c98a";

  useEffect(() => {
    recargar();
    obtenerCategorias();
    obtenerProveedores();
  }, []);

  const recargar = async () => {
    setCargando(true);
    const [{ data: prods, error }, { data: provs }] = await Promise.all([
      supabase
        .from("productos")
        .select(`*, usuarios(id_usuario, username, rol)`)
        .order("created_at", { ascending: false }),
      supabase
        .from("proveedores")
        .select("id_proveedor, nombre_proveedor, nit"),
    ]);
    if (error) { console.error("Error al cargar productos:", error); setCargando(false); return; }
    const provsMap = Object.fromEntries((provs || []).map((p) => [p.id_proveedor, p]));
    setProductos((prods || []).map((p) => ({ ...p, proveedores: provsMap[p.id_proveedor] || null })));
    setCargando(false);
  };

  const obtenerCategorias = async () => {
    const { data, error } = await supabase.from("categorias").select("*");
    if (error) { console.error("Error al cargar categorías:", error); return; }
    setCategorias(data || []);
  };

  const obtenerProveedores = async () => {
    const { data, error } = await supabase
      .from("proveedores")
      .select("id_proveedor, nombre_proveedor, nit")
      .order("nombre_proveedor");
    if (error) { console.error("Error al cargar proveedores:", error); return; }
    setProveedores(data || []);
  };

  const calcularEstado = (producto) => {
    const actual = parseInt(producto.stock_actual) || 0;
    const minimo = parseInt(producto.stock_minimo) || 10;
    if (actual > minimo * 1.5) return "alto";
    if (actual > minimo)       return "medio";
    return "bajo";
  };

  const getBadgeEstado = (producto) => {
    const estado = calcularEstado(producto);
    const estilos = {
      alto:  { texto: "Stock Alto",  color: "#1f9d55", fondo: "#e3f7e9" },
      medio: { texto: "Stock Medio", color: "#b8860b", fondo: "#fdf3da" },
      bajo:  { texto: "Stock Bajo",  color: "#c0392b", fondo: "#fbe2df" },
    };
    const e = estilos[estado];
    return (
      <span style={{ backgroundColor: e.fondo, color: e.color, fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "12px", display: "inline-block" }}>
        {e.texto}
      </span>
    );
  };

  const getBadgeStock = (producto) => {
    const estado = calcularEstado(producto);
    const colores = {
      alto:  { color: "#1f9d55", fondo: "#e3f7e9" },
      medio: { color: "#b8860b", fondo: "#fdf3da" },
      bajo:  { color: "#c0392b", fondo: "#fbe2df" },
    };
    const c = colores[estado];
    return (
      <span style={{ backgroundColor: c.fondo, color: c.color, fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "12px", display: "inline-block" }}>
        {producto.stock_actual}
      </span>
    );
  };

  const getBadgeRol = (rol) => {
    if (!rol) return <span className="text-muted">—</span>;
    return <span style={{ color: "#1a1a1a", fontSize: "13px", textTransform: "capitalize" }}>{rol}</span>;
  };

  const normalizar = (texto = "") =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtrados = productos.filter((p) => {
    const texto = normalizar(busqueda);
    const matchTexto =
      normalizar(p.nombre_producto || "").includes(texto) ||
      normalizar(String(p.id_producto)).includes(texto) ||
      normalizar(p.descripcion || "").includes(texto) ||
      normalizar(p.codigo_barras || "").includes(texto);
    const estado = calcularEstado(p);
    const matchEstado    = filtroEstado    === "todos" || estado === filtroEstado;
    const matchCategoria = filtroCategoria === "todas" || String(p.id_categoria) === String(filtroCategoria);
    const matchRol       = filtroRol       === "todos" || normalizar(p.usuarios?.rol || "") === normalizar(filtroRol);
    const matchUnidad    = filtroUnidad    === "todas" || normalizar(p.unidad_medida || "") === normalizar(filtroUnidad);
    const matchProveedor = filtroProveedor === "todos" || String(p.id_proveedor) === String(filtroProveedor);
    return matchTexto && matchEstado && matchCategoria && matchRol && matchUnidad && matchProveedor;
  });

  const unidadesDisponibles = Array.from(new Set(productos.map((p) => p.unidad_medida).filter(Boolean)));
  const nombreCategoria = (id) => categorias.find((c) => c.id_categoria == id)?.nombre_categoria || "Sin categoría";

  const abrirEdicion = (p) => {
    setFormEdit({
      nombre_producto: p.nombre_producto || "",
      descripcion:     p.descripcion     || "",
      precio_actual:   p.precio_actual   || "",
      stock_actual:    p.stock_actual    || "",
      unidad_medida:   p.unidad_medida   || "",
      id_categoria:    p.id_categoria    || "",
      id_proveedor:    p.id_proveedor    || "",
    });
    setEditarProducto(p);
  };

  const guardarEdicion = async () => {
    if (!editarProducto) return;
    setGuardando(true);

    const { error } = await supabase
      .from("productos")
      .update({
        nombre_producto: formEdit.nombre_producto,
        descripcion:     formEdit.descripcion,
        precio_actual:   formEdit.precio_actual,
        stock_actual:    formEdit.stock_actual,
        unidad_medida:   formEdit.unidad_medida,
        id_categoria:    formEdit.id_categoria ? parseInt(formEdit.id_categoria) : null,
        id_proveedor:    formEdit.id_proveedor ? parseInt(formEdit.id_proveedor) : null,
      })
      .eq("id_producto", editarProducto.id_producto);

    if (error) {
      console.error("Error al actualizar producto:", error);
      alert("No se pudo guardar el producto.");
      setGuardando(false);
      return;
    }

    // ← registrar movimiento si el stock cambió
    const stockAnterior = parseInt(editarProducto.stock_actual) || 0;
    const stockNuevo    = parseInt(formEdit.stock_actual) || 0;
    const diferencia    = stockNuevo - stockAnterior;

    if (diferencia !== 0) {
      await supabase.from("movimientos_inventario").insert([{
        id_producto:      editarProducto.id_producto,
        id_usuario:       usuario?.id_usuario || null,
        tipo_movimiento:  diferencia > 0 ? "entrada" : "salida",
        cantidad:         Math.abs(diferencia),
        observacion:      "Ajuste de stock desde edición de producto",
        fecha_movimiento: new Date().toISOString(),
      }]);
    }

    const proveedorActualizado = proveedores.find(
      (pv) => pv.id_proveedor === parseInt(formEdit.id_proveedor)
    ) || null;

    setProductos((prev) =>
      prev.map((p) =>
        p.id_producto === editarProducto.id_producto
          ? { ...p, ...formEdit, proveedores: proveedorActualizado }
          : p
      )
    );
    setGuardando(false);
    setEditarProducto(null);
  };

  const eliminarProducto = async (p) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${p.nombre_producto}"? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;
    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id_producto", p.id_producto);
    if (error) { console.error("Error al eliminar producto:", error); alert("No se pudo eliminar el producto."); return; }
    setProductos((prev) => prev.filter((item) => item.id_producto !== p.id_producto));
  };

 const crearProducto = async () => {
  if (!formNuevo.nombre_producto.trim()) { alert("El nombre del producto es obligatorio."); return; }
  setCreando(true);

  const payload = {
    nombre_producto: formNuevo.nombre_producto,
    descripcion:     formNuevo.descripcion  || null,
    precio_actual:   formNuevo.precio_actual || null,
    stock_actual:    formNuevo.stock_actual  || null,
    unidad_medida:   formNuevo.unidad_medida || null,
    codigo_barras:   formNuevo.codigo_barras || null,
    id_categoria:    formNuevo.id_categoria  ? parseInt(formNuevo.id_categoria) : null,
    id_proveedor:    formNuevo.id_proveedor  ? parseInt(formNuevo.id_proveedor) : null,
    id_usuario:      usuario?.id_usuario || null,
  };

  const { data, error } = await supabase
    .from("productos")
    .insert([payload])
    .select(`*, usuarios(id_usuario, username, rol)`);

  setCreando(false);

  if (error) { console.error("Error al crear producto:", error); alert("No se pudo crear el producto."); return; }

  if (data && data.length > 0) {
    const productoCreado = data[0];

    // ← movimiento de entrada inicial
    if (formNuevo.stock_actual && parseInt(formNuevo.stock_actual) > 0) {
      await supabase.from("movimientos_inventario").insert([{
        id_producto:      productoCreado.id_producto,
        id_usuario:       usuario?.id_usuario || null,
        tipo_movimiento:  "entrada",
        cantidad:         parseInt(formNuevo.stock_actual),
        observacion:      "Stock inicial al crear producto",
        fecha_movimiento: new Date().toISOString(),
      }]);
    }

    // ← registro en historial de precios si tiene precio
    if (formNuevo.precio_actual && parseFloat(formNuevo.precio_actual) > 0) {
      await supabase.from("historial_precios").insert([{
        id_producto:      productoCreado.id_producto,
        precio_anterior:  0,
        precio_nuevo:     parseFloat(formNuevo.precio_actual),
        motivo:           "Precio inicial al crear producto",
        fecha_cambio:     new Date().toISOString(),
      }]);
    }

    setProductos((prev) => [productoCreado, ...prev]);
  } else {
    recargar();
  }

  setFormNuevo({ nombre_producto: "", descripcion: "", precio_actual: "", stock_actual: "", unidad_medida: "", codigo_barras: "", id_categoria: "", id_proveedor: "" });
  setMostrarCrear(false);
};

  const labelFiltro = { fontSize: "12px", fontWeight: 600, color: DORADO_OSCURO, marginBottom: "4px", display: "block" };
  const selectStyle = { width: "100%", padding: "9px 12px", marginBottom: 12, borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", background: "#fafafa", color: "#111827" };
  const inputStyle  = { ...selectStyle };
  const labelStyle  = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 };

  return (
    <div className="p-4" style={{ margin: 0, backgroundColor: FONDO, minHeight: "100vh", width: "100%" }}>

      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Gestión de Inventario{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>- Administra productos de vehículos blindados</span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
        <button className="btn d-flex align-items-center gap-2 fw-semibold" onClick={() => setMostrarCrear(true)}
          style={{ background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff", borderRadius: "8px", padding: "8px 18px 8px 8px", border: "none", boxShadow: "0 3px 12px rgba(140,107,63,0.55)" }}>
          <span className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.25)" }}>
            <Plus size={14} />
          </span>
          Agregar Producto
        </button>
      </div>

      {/* FILTROS */}
      <div className="p-4 rounded-4 shadow-sm mb-4" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>
        <div className="mb-3 position-relative">
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
          <input type="text" className="form-control rounded-pill"
            style={{ paddingLeft: "36px", paddingTop: "10px", paddingBottom: "10px" }}
            placeholder="Buscar por producto, código o descripción..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="d-flex gap-3 flex-wrap align-items-end">
          <div style={{ minWidth: "150px", flex: "1 1 150px" }}>
            <label style={labelFiltro}>Categoría</label>
            <select className="form-select rounded-pill" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="todas">Todas</option>
              {categorias.map((cat) => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>)}
            </select>
          </div>
          <div style={{ minWidth: "150px", flex: "1 1 150px" }}>
            <label style={labelFiltro}>Proveedor</label>
            <select className="form-select rounded-pill" value={filtroProveedor} onChange={(e) => setFiltroProveedor(e.target.value)}>
              <option value="todos">Todos</option>
              {proveedores.map((pv) => <option key={pv.id_proveedor} value={pv.id_proveedor}>{pv.nombre_proveedor}</option>)}
            </select>
          </div>
          <div style={{ minWidth: "150px", flex: "1 1 150px" }}>
            <label style={labelFiltro}>Estado</label>
            <select className="form-select rounded-pill" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="alto">Stock Alto</option>
              <option value="medio">Stock Medio</option>
              <option value="bajo">Stock Bajo</option>
            </select>
          </div>
          <div style={{ minWidth: "150px", flex: "1 1 150px" }}>
            <label style={labelFiltro}>Unidad</label>
            <select className="form-select rounded-pill" value={filtroUnidad} onChange={(e) => setFiltroUnidad(e.target.value)}>
              <option value="todas">Todas</option>
              {unidadesDisponibles.map((unidad) => <option key={unidad} value={unidad}>{unidad}</option>)}
            </select>
          </div>
          <div style={{ minWidth: "150px", flex: "1 1 150px" }}>
            <label style={labelFiltro}>Usuario</label>
            <select className="form-select rounded-pill" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="mecanico">Mecánico</option>
              <option value="admin">Admin</option>
              <option value="gerente">Gerente</option>
              <option value="contadora">Contadora</option>
            </select>
          </div>
          <button className="btn d-flex align-items-center gap-1 fw-semibold"
            style={{ color: DORADO_OSCURO, border: `1px solid ${DORADO_OSCURO}`, borderRadius: "20px", padding: "8px 16px", whiteSpace: "nowrap" }}
            onClick={() => { setBusqueda(""); setFiltroEstado("todos"); setFiltroCategoria("todas"); setFiltroRol("todos"); setFiltroUnidad("todas"); setFiltroProveedor("todos"); }}>
            <X size={14} /> Limpiar Filtros
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        {cargando ? (
          <div className="text-center py-5 text-muted">Cargando productos...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Package size={40} className="mb-2 opacity-50" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ minWidth: "1350px", backgroundColor: "#fffdf8" }}>
              <thead>
                <tr style={{ backgroundColor: ENCABEZADO }}>
                  {["ID", "Cód. Barras", "Producto", "Descripción", "Categoría", "Proveedor", "Usuario", "Rol", "Unidad", "Stock", "Precio", "Estado", "Acciones"].map((h) => (
                    <th key={h}
                      className={h === "ID" ? "ps-3" : h === "Acciones" ? "text-center" : ""}
                      style={{ backgroundColor: ENCABEZADO, color: TEXTO_ENCABEZADO, fontSize: "13px", border: "none", padding: "12px 8px", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id_producto} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                    <td className="ps-3 fw-bold" style={{ fontSize: "13px", color: DORADO_OSCURO }}>#{p.id_producto}</td>
                    <td className="text-muted small">{p.codigo_barras || "—"}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {p.imagen ? (
                          <img src={p.imagen} alt="" style={{ width: "35px", height: "35px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: "35px", height: "35px", borderRadius: "8px", background: "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Package size={16} color={DORADO_OSCURO} />
                          </div>
                        )}
                        <span className="fw-semibold" style={{ fontSize: "13px" }}>{p.nombre_producto}</span>
                      </div>
                    </td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: "130px" }}>{p.descripcion || "—"}</td>
                    <td style={{ fontSize: "13px" }}>{nombreCategoria(p.id_categoria)}</td>
                    <td style={{ fontSize: "13px" }}>
                      {p.proveedores ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{p.proveedores.nombre_proveedor}</span>
                          <span style={{ fontSize: 11, color: "#6b7280" }}>{p.proveedores.nit}</span>
                        </div>
                      ) : (
                        <span style={{ color: "#9ca3af", fontStyle: "italic", fontSize: 12 }}>Sin proveedor</span>
                      )}
                    </td>
                    <td style={{ fontSize: "13px" }}>{p.usuarios?.username || "—"}</td>
                    <td>{getBadgeRol(p.usuarios?.rol)}</td>
                    <td className="text-muted small">{p.unidad_medida || "—"}</td>
                    <td>{getBadgeStock(p)}</td>
                    <td className="fw-bold" style={{ fontSize: "13px" }}>{p.precio_actual ? `$${p.precio_actual}` : "—"}</td>
                    <td>{getBadgeEstado(p)}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-3">
                        <Eye    size={19} style={{ cursor: "pointer", color: "#555"        }} onClick={() => setVerProducto(p)} />
                        <Pencil size={19} style={{ cursor: "pointer", color: DORADO_OSCURO }} onClick={() => abrirEdicion(p)} />
                        <Trash2 size={19} style={{ cursor: "pointer", color: "#c0392b"     }} onClick={() => eliminarProducto(p)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL VER DETALLE */}
      {verProducto && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setVerProducto(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: "380px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Detalle del Producto</h5>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setVerProducto(null)} />
            </div>
            {verProducto.imagen ? (
              <img src={verProducto.imagen} alt="" style={{ width: "100%", borderRadius: "10px", marginBottom: "12px" }} />
            ) : (
              <div style={{ width: "100%", height: "120px", borderRadius: "10px", background: "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Package size={40} color={DORADO_OSCURO} />
              </div>
            )}
            {[
              ["ID",           `#${verProducto.id_producto}`],
              ["Cód. Barras",  verProducto.codigo_barras || "—"],
              ["Nombre",       verProducto.nombre_producto],
              ["Descripción",  verProducto.descripcion || "—"],
              ["Categoría",    nombreCategoria(verProducto.id_categoria)],
              ["Proveedor",    verProducto.proveedores?.nombre_proveedor || "Sin proveedor"],
              ["NIT",          verProducto.proveedores?.nit || "—"],
              ["Usuario",      verProducto.usuarios?.username || "—"],
              ["Rol",          verProducto.usuarios?.rol || "—"],
              ["Unidad",       verProducto.unidad_medida || "—"],
              ["Precio",       verProducto.precio_actual ? `$${verProducto.precio_actual}` : "—"],
              ["Stock actual", verProducto.stock_actual],
              ["Activo",       verProducto.activo ? "Sí" : "No"],
            ].map(([label, val]) => (
              <p key={label} className="mb-1" style={{ fontSize: 13 }}>
                <strong>{label}:</strong> {val}
              </p>
            ))}
            <p className="mb-1" style={{ fontSize: 13 }}>
              <strong>Estado:</strong> {getBadgeEstado(verProducto)}
            </p>
            <button onClick={() => setVerProducto(null)} className="btn btn-secondary w-100 mt-3">Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRODUCTO */}
      {editarProducto && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setEditarProducto(null)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: "420px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h5 className="fw-bold mb-0">Editar Producto</h5>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setEditarProducto(null)} />
            </div>
            <div style={{ width: 40, height: 3, backgroundColor: DORADO_OSCURO, borderRadius: 4, marginBottom: 18 }} />

            <label style={labelStyle}>Nombre</label>
            <input type="text" style={inputStyle} value={formEdit.nombre_producto || ""}
              onChange={(e) => setFormEdit({ ...formEdit, nombre_producto: e.target.value })} />

            <label style={labelStyle}>Descripción</label>
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={formEdit.descripcion || ""}
              onChange={(e) => setFormEdit({ ...formEdit, descripcion: e.target.value })} />

            <label style={labelStyle}>Categoría</label>
            <select style={selectStyle} value={formEdit.id_categoria || ""}
              onChange={(e) => setFormEdit({ ...formEdit, id_categoria: e.target.value })}>
              <option value="">Sin categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
              ))}
            </select>

            <label style={labelStyle}>Proveedor</label>
            <select style={selectStyle} value={formEdit.id_proveedor || ""}
              onChange={(e) => setFormEdit({ ...formEdit, id_proveedor: e.target.value })}>
              <option value="">Sin proveedor</option>
              {proveedores.map((pv) => (
                <option key={pv.id_proveedor} value={pv.id_proveedor}>
                  {pv.nombre_proveedor} — {pv.nit}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Precio</label>
            <input type="number" style={inputStyle} value={formEdit.precio_actual || ""}
              onChange={(e) => setFormEdit({ ...formEdit, precio_actual: e.target.value })} />

            <label style={labelStyle}>Stock actual</label>
            <input type="number" style={inputStyle} value={formEdit.stock_actual || ""}
              onChange={(e) => setFormEdit({ ...formEdit, stock_actual: e.target.value })} />

            <label style={labelStyle}>Unidad de medida</label>
            <input type="text" style={inputStyle} value={formEdit.unidad_medida || ""}
              onChange={(e) => setFormEdit({ ...formEdit, unidad_medida: e.target.value })} />

            <div className="d-flex gap-2 mt-2">
              <button onClick={() => setEditarProducto(null)} className="btn btn-secondary flex-fill" disabled={guardando}>
                Cancelar
              </button>
              <button onClick={guardarEdicion} disabled={guardando} className="btn flex-fill fw-semibold"
                style={{ background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff", border: "none" }}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR PRODUCTO */}
      {mostrarCrear && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setMostrarCrear(false)}>
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: "420px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h5 className="fw-bold mb-0">Agregar Producto</h5>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setMostrarCrear(false)} />
            </div>
            <div style={{ width: 40, height: 3, backgroundColor: DORADO_OSCURO, borderRadius: 4, marginBottom: 18 }} />

            <label style={labelStyle}>Nombre *</label>
            <input type="text" style={inputStyle} value={formNuevo.nombre_producto}
              onChange={(e) => setFormNuevo({ ...formNuevo, nombre_producto: e.target.value })} />

            <label style={labelStyle}>Código de barras</label>
            <input type="text" style={inputStyle} value={formNuevo.codigo_barras}
              onChange={(e) => setFormNuevo({ ...formNuevo, codigo_barras: e.target.value })} />

            <label style={labelStyle}>Descripción</label>
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={formNuevo.descripcion}
              onChange={(e) => setFormNuevo({ ...formNuevo, descripcion: e.target.value })} />

            <label style={labelStyle}>Categoría</label>
            <select style={selectStyle} value={formNuevo.id_categoria}
              onChange={(e) => setFormNuevo({ ...formNuevo, id_categoria: e.target.value })}>
              <option value="">Sin categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
              ))}
            </select>

            <label style={labelStyle}>Proveedor</label>
            <select style={selectStyle} value={formNuevo.id_proveedor}
              onChange={(e) => setFormNuevo({ ...formNuevo, id_proveedor: e.target.value })}>
              <option value="">Sin proveedor</option>
              {proveedores.map((pv) => (
                <option key={pv.id_proveedor} value={pv.id_proveedor}>
                  {pv.nombre_proveedor} — {pv.nit}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Precio</label>
            <input type="number" style={inputStyle} value={formNuevo.precio_actual}
              onChange={(e) => setFormNuevo({ ...formNuevo, precio_actual: e.target.value })} />

            <label style={labelStyle}>Stock inicial</label>
            <input type="number" style={inputStyle} value={formNuevo.stock_actual}
              onChange={(e) => setFormNuevo({ ...formNuevo, stock_actual: e.target.value })} />

            <label style={labelStyle}>Unidad de medida</label>
            <input type="text" style={inputStyle} value={formNuevo.unidad_medida}
              onChange={(e) => setFormNuevo({ ...formNuevo, unidad_medida: e.target.value })} />

            <div className="d-flex gap-2 mt-2">
              <button onClick={() => setMostrarCrear(false)} className="btn btn-secondary flex-fill" disabled={creando}>
                Cancelar
              </button>
              <button onClick={crearProducto} disabled={creando} className="btn flex-fill fw-semibold"
                style={{ background: `linear-gradient(135deg, #c9941f, ${DORADO_OSCURO})`, color: "#fff", border: "none" }}>
                {creando ? "Guardando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;