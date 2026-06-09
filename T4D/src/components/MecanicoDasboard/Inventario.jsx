import { useState, useEffect } from "react";
import { Eye, Pencil, Trash2, Plus, X, Package } from "lucide-react";
import { supabase } from "../../supabase/supabaseClient";

function Inventario() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [verProducto, setVerProducto] = useState(null);
  const [cargando, setCargando] = useState(false);

  const productoVacio = {
    nombre_producto: "",
    descripcion: "",
    precio_actual: "",
    stock_actual: "",
    unidad_medida: "",
    codigo_barras: "",
    id_categoria: "",
    imagen: "",
    activo: true,
  };

  const [nuevoProducto, setNuevoProducto] = useState(productoVacio);

  useEffect(() => {
    recargar();
    obtenerCategorias();
  }, []);

  const recargar = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("productos")
      .select(`
        *,
        usuarios (
          id_usuario,
          username,
          rol
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar productos:", error);
      setCargando(false);
      return;
    }

    setProductos(data || []);
    setCargando(false);
  };

  const obtenerCategorias = async () => {
    const { data, error } = await supabase.from("categorias").select("*");
    if (error) {
      console.error("Error al cargar categorías:", error);
      return;
    }
    setCategorias(data || []);
  };

  const calcularEstado = (producto) => {
    const actual = parseInt(producto.stock_actual) || 0;
    const minimo = parseInt(producto.stock_minimo) || 10;
    if (actual > minimo * 1.5) return "alto";
    if (actual > minimo) return "medio";
    return "bajo";
  };

  const getBadgeEstado = (producto) => {
    const estado = calcularEstado(producto);
    if (estado === "alto")
      return <span className="badge bg-success">Stock Alto</span>;
    if (estado === "medio")
      return <span className="badge bg-warning text-dark">Stock Medio</span>;
    return <span className="badge bg-danger">Stock Bajo</span>;
  };

  const normalizar = (texto = "") =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtrados = productos.filter((p) => {
    const texto = normalizar(busqueda);
    const matchTexto =
      normalizar(p.nombre_producto || "").includes(texto) ||
      normalizar(String(p.id_producto)).includes(texto) ||
      normalizar(p.descripcion || "").includes(texto) ||
      normalizar(p.codigo_barras || "").includes(texto);

    const estado = calcularEstado(p);
    const matchEstado = filtroEstado === "todos" || estado === filtroEstado;

    const matchCategoria =
      filtroCategoria === "todas" ||
      String(p.id_categoria) === String(filtroCategoria);

    const matchRol =
      filtroRol === "todos" ||
      normalizar(p.usuarios?.rol || "") === normalizar(filtroRol);

    return matchTexto && matchEstado && matchCategoria && matchRol;
  });

  const guardarProducto = async (e) => {
    e.preventDefault();

    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")); // ← leer fresco

    const payload = {
      nombre_producto: nuevoProducto.nombre_producto,
      descripcion: nuevoProducto.descripcion || null,
      precio_actual: nuevoProducto.precio_actual
        ? parseFloat(nuevoProducto.precio_actual)
        : null,
      stock_actual: parseInt(nuevoProducto.stock_actual) || 0,
      unidad_medida: nuevoProducto.unidad_medida || null,
      codigo_barras: nuevoProducto.codigo_barras || null,
      id_categoria: nuevoProducto.id_categoria
        ? parseInt(nuevoProducto.id_categoria)
        : null,
      imagen: nuevoProducto.imagen || null,
      activo: true,
      id_usuario: usuarioLogueado?.id_usuario || null,
    };

    let error;

    if (modoEdicion && productoEditar) {
      ({ error } = await supabase
        .from("productos")
        .update(payload)
        .eq("id_producto", productoEditar.id_producto));

      if (error) {
        console.error("Error al actualizar:", error);
        alert("Error al actualizar el producto: " + error.message);
        return;
      }
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("productos")
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        console.error("Error al insertar:", insertError);
        alert("Error al guardar el producto: " + insertError.message);
        return;
      }

      const { error: movError } = await supabase
        .from("movimientos_inventario")
        .insert([{
          id_producto: inserted.id_producto,
          id_usuario: usuarioLogueado?.id_usuario || null,
          tipo_movimiento: "entrada",
          cantidad: parseInt(nuevoProducto.stock_actual) || 0,
          observacion: "Ingreso inicial de inventario",
        }]);

      if (movError) {
        console.error("Error al registrar movimiento:", movError);
      }

      error = null;
    }

    if (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el producto: " + error.message);
      return;
    }

    cerrarModal();
    recargar();
  };

 const eliminarProducto = async (id) => {
  if (!window.confirm("¿Eliminar este producto?")) return;

  // Eliminar movimientos relacionados
  const { error: movError } = await supabase
    .from("movimientos_inventario")
    .delete()
    .eq("id_producto", id);

  if (movError) {
    console.error("Error eliminando movimientos:", movError);
    alert("Error eliminando movimientos");
    return;
  }

  // Eliminar producto
  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id_producto", id);

  if (error) {
    console.error("Error al eliminar:", error);
    alert("Error al eliminar: " + error.message);
    return;
  }

  recargar();
};

  const editarProducto = (producto) => {
    setNuevoProducto({
      nombre_producto: producto.nombre_producto || "",
      descripcion: producto.descripcion || "",
      precio_actual: producto.precio_actual || "",
      stock_actual: producto.stock_actual || "",
      unidad_medida: producto.unidad_medida || "",
      codigo_barras: producto.codigo_barras || "",
      id_categoria: producto.id_categoria || "",
      imagen: producto.imagen || "",
      activo: producto.activo ?? true,
    });
    setProductoEditar(producto);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setProductoEditar(null);
    setNuevoProducto(productoVacio);
  };

  const nombreCategoria = (id) =>
    categorias.find((c) => c.id_categoria == id)?.nombre_categoria ||
    "Sin categoría";

  return (
    <div className="p-4" style={{ marginTop: "1px" }}>
      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-0">Gestión de Inventario</h4>
          <p className="text-muted mb-0">
            Administra productos de vehículos blindados
          </p>
        </div>

        <button
          onClick={() => {
            setModoEdicion(false);
            setNuevoProducto(productoVacio);
            setMostrarModal(true);
          }}
          className="btn rounded-pill d-flex align-items-center gap-2"
          style={{ backgroundColor: "#b89b6a", color: "#fff" }}
        >
          <Plus size={16} />
          Agregar Producto
        </button>
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4">
        <h6 className="fw-bold mb-2">Filtros y Búsqueda</h6>
        {/* Fila 1: Búsqueda */}
        <div className="mb-2">
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar por nombre, ID, descripción o código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Fila 2: Selects */}
        <div className="d-flex gap-3 flex-wrap">
          {/* Filtro stock */}
          <select
            className="form-select rounded-pill"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ maxWidth: "170px" }}
          >
            <option value="todos">Todo el stock</option>
            <option value="alto">Stock Alto</option>
            <option value="medio">Stock Medio</option>
            <option value="bajo">Stock Bajo</option>
          </select>

          {/* Filtro categoría (cargado desde Supabase) */}
          <select
            className="form-select rounded-pill"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            style={{ maxWidth: "190px" }}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre_categoria}
              </option>
            ))}
          </select>

          {/* Filtro rol */}
          <select
            className="form-select rounded-pill"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            style={{ maxWidth: "160px" }}
          >
            <option value="todos">Todos los roles</option>
            <option value="mecanico">Mecánico</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        {cargando ? (
          <div className="text-center py-5 text-muted">Cargando productos...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Package size={40} className="mb-2 opacity-50" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle" style={{ minWidth: "1150px" }}>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
                  <th style={{ width: "130px" }}>Cód. Barras</th>
                  <th style={{ minWidth: "160px" }}>Producto</th>
                  <th style={{ minWidth: "130px" }}>Descripción</th>
                  <th style={{ width: "110px" }}>Categoría</th>
                  <th style={{ width: "100px" }}>Usuario</th>
                  <th style={{ width: "90px" }}>Rol</th>
                  <th style={{ width: "80px" }}>Unidad</th>
                  <th style={{ width: "75px" }}>Stock</th>
                  <th style={{ width: "95px" }}>Precio</th>
                  <th style={{ width: "105px" }}>Estado</th>
                  <th style={{ width: "100px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id_producto}>
                    <td className="text-muted small">#{p.id_producto}</td>

                    <td className="text-muted small">{p.codigo_barras || "—"}</td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {p.imagen ? (
                          <img
                            src={p.imagen}
                            alt=""
                            style={{
                              width: "35px",
                              height: "35px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "35px",
                              height: "35px",
                              borderRadius: "8px",
                              background: "#f0ece4",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Package size={16} color="#b89b6a" />
                          </div>
                        )}
                        <span className="fw-semibold">{p.nombre_producto}</span>
                      </div>
                    </td>

                    <td className="text-muted small text-truncate" style={{ maxWidth: "130px" }}>
                      {p.descripcion || "—"}
                    </td>

                    <td>{nombreCategoria(p.id_categoria)}</td>

                    <td>{p.usuarios?.username || "—"}</td>

                    <td>
                      {p.usuarios?.rol ? (
                        <span className="badge bg-dark">{p.usuarios.rol}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    <td className="text-muted small">{p.unidad_medida || "—"}</td>

                    <td className="fw-bold">{p.stock_actual}</td>

                    <td className="fw-bold">
                      {p.precio_actual ? `$${p.precio_actual}` : "—"}
                    </td>

                    <td>{getBadgeEstado(p)}</td>

                    <td>
                      <div className="d-flex gap-3 align-items-center">
                        <Eye
                          size={18}
                          style={{ cursor: "pointer", color: "#6c757d" }}
                          onClick={() => setVerProducto(p)}
                        />
                        <Pencil
                          size={18}
                          style={{ cursor: "pointer", color: "#b89b6a" }}
                          onClick={() => editarProducto(p)}
                        />
                        <Trash2
                          size={18}
                          style={{ cursor: "pointer", color: "#dc3545" }}
                          onClick={() => eliminarProducto(p.id_producto)}
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

      {/* MODAL VER DETALLE */}
      {verProducto && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={() => setVerProducto(null)}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: "360px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Detalle del Producto</h5>
              <X
                size={20}
                style={{ cursor: "pointer" }}
                onClick={() => setVerProducto(null)}
              />
            </div>

            {verProducto.imagen ? (
              <img
                src={verProducto.imagen}
                alt=""
                style={{ width: "100%", borderRadius: "10px", marginBottom: "12px" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "120px",
                  borderRadius: "10px",
                  background: "#f0ece4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <Package size={40} color="#b89b6a" />
              </div>
            )}

            {[
              ["ID", `#${verProducto.id_producto}`],
              ["Cód. Barras", verProducto.codigo_barras || "—"],
              ["Nombre", verProducto.nombre_producto],
              ["Descripción", verProducto.descripcion || "—"],
              ["Categoría", nombreCategoria(verProducto.id_categoria)],
              ["Usuario", verProducto.usuarios?.username || "—"],
              ["Rol", verProducto.usuarios?.rol || "—"],
              ["Unidad", verProducto.unidad_medida || "—"],
              ["Precio", verProducto.precio_actual ? `$${verProducto.precio_actual}` : "—"],
              ["Stock actual", verProducto.stock_actual],
              ["Activo", verProducto.activo ? "Sí" : "No"],
            ].map(([label, val]) => (
              <p key={label} className="mb-1">
                <strong>{label}:</strong> {val}
              </p>
            ))}

            <p className="mb-1">
              <strong>Estado:</strong> {getBadgeEstado(verProducto)}
            </p>

            <button
              onClick={() => setVerProducto(null)}
              className="btn btn-secondary w-100 mt-3"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR */}
      {mostrarModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={cerrarModal}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: "420px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                {modoEdicion ? "Editar Producto" : "Agregar Producto"}
              </h5>
              <X size={20} style={{ cursor: "pointer" }} onClick={cerrarModal} />
            </div>

            <form onSubmit={guardarProducto}>
              <label className="form-label fw-semibold mb-1">Nombre *</label>
              <input
                className="form-control mb-3"
                placeholder="Nombre del producto"
                value={nuevoProducto.nombre_producto}
                required
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, nombre_producto: e.target.value })
                }
              />

              <label className="form-label fw-semibold mb-1">Descripción</label>
              <textarea
                className="form-control mb-3"
                placeholder="Descripción opcional"
                rows={2}
                value={nuevoProducto.descripcion}
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })
                }
              />

              <label className="form-label fw-semibold mb-1">Código de Barras</label>
              <input
                className="form-control mb-3"
                placeholder="Ej: 7501234567890"
                value={nuevoProducto.codigo_barras}
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, codigo_barras: e.target.value })
                }
              />

              <div className="row g-2 mb-3">
                <div className="col">
                  <label className="form-label fw-semibold mb-1">Stock actual *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    min="0"
                    required
                    value={nuevoProducto.stock_actual}
                    onChange={(e) =>
                      setNuevoProducto({ ...nuevoProducto, stock_actual: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col">
                  <label className="form-label fw-semibold mb-1">Precio</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={nuevoProducto.precio_actual}
                    onChange={(e) =>
                      setNuevoProducto({ ...nuevoProducto, precio_actual: e.target.value })
                    }
                  />
                </div>
                <div className="col">
                  <label className="form-label fw-semibold mb-1">Unidad</label>
                  <input
                    className="form-control"
                    placeholder="ej: unidad, kg..."
                    value={nuevoProducto.unidad_medida}
                    onChange={(e) =>
                      setNuevoProducto({ ...nuevoProducto, unidad_medida: e.target.value })
                    }
                  />
                </div>
              </div>

              <label className="form-label fw-semibold mb-1">Categoría</label>
              <select
                className="form-select mb-3"
                value={nuevoProducto.id_categoria}
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, id_categoria: e.target.value })
                }
              >
                <option value="">Seleccione categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre_categoria}
                  </option>
                ))}
              </select>

              <label className="form-label fw-semibold mb-1">URL de imagen</label>
              <input
                className="form-control mb-4"
                placeholder="https://..."
                value={nuevoProducto.imagen}
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })
                }
              />

              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={cerrarModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ backgroundColor: "#b89b6a", color: "#fff" }}
                >
                  {modoEdicion ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;