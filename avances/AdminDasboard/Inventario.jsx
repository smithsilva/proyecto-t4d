import { useState, useEffect } from "react";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";
import img1 from "../../assets/img1.jpg";

const API = "http://localhost:3001/api/productos";

// ✅ Fuera del componente para que no se recree
const estadoVacio = {
  codigo_barras: "",
  nombre_producto: "",
  descripcion: "",
  stock_actual: "",
  imagen: "",
};

function Inventario() {

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [productos, setProductos] = useState([]);
  const [verProducto, setVerProducto] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState(estadoVacio);

  // =========================================
  // OBTENER PRODUCTOS
  // =========================================

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {

      const res = await fetch(API);
      if (!res.ok) throw new Error("Error al obtener productos");

      const data = await res.json();

      const adaptados = data.map((item) => {
        const stock = parseInt(item.stock_actual) || 0;
        return {
          id:           item.id_producto,
          codigo_barras: item.codigo_barras,
          nombre:       item.nombre_producto,
          descripcion:  item.descripcion || "Sin descripción",
          fechaEntrada: item.created_at ? item.created_at.split("T")[0] : "Sin fecha",
          stock,
          estado: stock > 15 ? "alto" : stock > 5 ? "medio" : "bajo",
          imagen: item.imagen || img1,
        };
      });

      setProductos(adaptados);

    } catch (error) {
      console.log(error);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los productos" });
    }
  };

  // =========================================
  // NORMALIZAR / FILTROS
  // =========================================

  const normalizar = (texto = "") =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtrados = productos.filter((p) => {
    const texto = normalizar(busqueda);
    return (
      (
        normalizar(p.nombre).includes(texto) ||
        normalizar(String(p.id)).includes(texto) ||
        normalizar(p.descripcion).includes(texto) ||
        normalizar(p.codigo_barras).includes(texto)
      ) &&
      (filtroEstado === "todos" || p.estado === filtroEstado)
    );
  });

  // =========================================
  // BADGE ESTADO
  // =========================================

  const getEstado = (estado) => {
    const estilos = {
      alto:  { background: "#B89B6A", color: "#000" },
      medio: { background: "#374151", color: "#fff" },
      bajo:  { background: "#1f2937", color: "#fff" },
    };
    return (
      <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", textTransform: "capitalize", ...estilos[estado] }}>
        {estado}
      </span>
    );
  };

  // =========================================
  // AGREGAR / EDITAR
  // =========================================

  const agregarProducto = async () => {

    // Validar
    if (
      !nuevoProducto.codigo_barras ||
      !nuevoProducto.nombre_producto ||
      !nuevoProducto.descripcion ||
      !nuevoProducto.stock_actual
    ) {
      return Swal.fire({ icon: "warning", title: "Campos vacíos", text: "Completa todos los campos" });
    }

    // ✅ Construir body
    const body = {
      codigo_barras:   nuevoProducto.codigo_barras,
      nombre_producto: nuevoProducto.nombre_producto,
      descripcion:     nuevoProducto.descripcion,
      stock_actual:    parseInt(nuevoProducto.stock_actual),
      imagen:          nuevoProducto.imagen,
    };

    console.log("BODY enviado:", body); // verificar en consola navegador F12

    try {

      const url    = modoEdicion ? `${API}/${productoEditar.id}` : API;
      const method = modoEdicion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        console.log("Error API:", err);
        throw new Error("Error en la operación");
      }

      Swal.fire({
        icon: "success",
        title: modoEdicion ? "Producto actualizado" : "Producto agregado",
        timer: 1500,
        showConfirmButton: false,
      });

      obtenerProductos();
      setMostrarModal(false);
      setModoEdicion(false);
      setProductoEditar(null);
      setNuevoProducto(estadoVacio);

    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: modoEdicion ? "No se pudo editar el producto" : "No se pudo guardar el producto",
      });
    }
  };

  // =========================================
  // ELIMINAR
  // =========================================

  const eliminarProducto = async (id) => {

    const confirmacion = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");

      Swal.fire({ icon: "success", title: "Producto eliminado", timer: 1500, showConfirmButton: false });
      obtenerProductos();

    } catch (error) {
      console.log(error);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar" });
    }
  };

  // =========================================
  // EDITAR — cargar datos en el modal
  // =========================================

  const editarProducto = (producto) => {
    setNuevoProducto({
      codigo_barras:   producto.codigo_barras || "",
      nombre_producto: producto.nombre,
      descripcion:     producto.descripcion,
      stock_actual:    String(producto.stock),
      imagen:          producto.imagen || "",
    });
    setProductoEditar(producto);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="p-5" style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Gestión de Inventario</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Administra productos de vehículos blindados</p>
        </div>

        {/* ✅ onClick sin e.preventDefault, la función ya no recibe evento */}
        <button
          onClick={() => {
            setModoEdicion(false);
            setNuevoProducto(estadoVacio);
            setMostrarModal(true);
          }}
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}
        >
          <Plus size={16} className="me-1" /> Agregar
        </button>
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Filtros y Búsqueda</h6>
        <div className="d-flex gap-3">
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className="form-select rounded-pill"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="todos">Todo el stock</option>
            <option value="alto">Stock Alto</option>
            <option value="medio">Stock Medio</option>
            <option value="bajo">Stock Bajo</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>ID</th><th>Producto</th><th>Código</th>
              <th>Descripción</th><th>Entrada</th>
              <th>Stock</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img src={p.imagen} alt="" style={{ width: "35px", height: "35px", borderRadius: "8px", objectFit: "cover" }} />
                    <span>{p.id}</span>
                  </div>
                </td>
                <td>{p.nombre}</td>
                <td>{p.codigo_barras}</td>
                <td>{p.descripcion}</td>
                <td>{p.fechaEntrada}</td>
                <td className="fw-bold">{p.stock}</td>
                <td>{getEstado(p.estado)}</td>
                <td className="d-flex gap-2">
                  <Eye    size={18} style={{ cursor: "pointer", color: "#374151" }} onClick={() => setVerProducto(p)} />
                  <Pencil size={18} style={{ cursor: "pointer", color: "#374151" }} onClick={() => editarProducto(p)} />
                  <Trash2 size={18} style={{ cursor: "pointer", color: "#ef4444" }} onClick={() => eliminarProducto(p.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-3">

              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  {modoEdicion ? "Editar producto" : "Agregar producto"}
                </h5>
                <button className="btn-close" onClick={() => setMostrarModal(false)} />
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-2 rounded-pill"
                  placeholder="Código de barras"
                  value={nuevoProducto.codigo_barras}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, codigo_barras: e.target.value })}
                />
                <input
                  className="form-control mb-2 rounded-pill"
                  placeholder="Nombre"
                  value={nuevoProducto.nombre_producto}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre_producto: e.target.value })}
                />
                <input
                  className="form-control mb-2 rounded-pill"
                  placeholder="Descripción"
                  value={nuevoProducto.descripcion}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                />
                <input
                  type="number"
                  className="form-control mb-2 rounded-pill"
                  placeholder="Stock"
                  value={nuevoProducto.stock_actual}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock_actual: e.target.value })}
                />
                <input
                  className="form-control mb-2 rounded-pill"
                  placeholder="URL de imagen (opcional)"
                  value={nuevoProducto.imagen}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })}
                />
              </div>

              <div className="modal-footer border-0">
                <button className="btn btn-secondary rounded-pill" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                {/* ✅ onClick llama directo, sin pasar evento */}
                <button
                  className="btn rounded-pill"
                  style={{ backgroundColor: "#B89B6A", color: "#000" }}
                  onClick={agregarProducto}
                >
                  {modoEdicion ? "Guardar cambios" : "Agregar"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Inventario;