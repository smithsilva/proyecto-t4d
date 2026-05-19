import { useState, useEffect } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import img1 from "../../assets/img1.jpg";

import { supabase } from "../../supabase/supabaseClient";

function Inventario() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarModal, setMostrarModal] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  const [productos, setProductos] = useState([]);

  // CATEGORÍAS
  const [categorias, setCategorias] = useState([]);

  // 👁 MODAL VER
  const [verProducto, setVerProducto] = useState(null);

  // USUARIO LOGUEADO
  const usuarioLogueado = JSON.parse(
    localStorage.getItem("usuario")
  );

  const API = "https://69db2601560857310a075c00.mockapi.io/productos";

  const [nuevoProducto, setNuevoProducto] = useState({
    id: "",
    nombre: "",
    fechaEntrada: "",
    stock: "",
    imagen: "",
    id_categoria: "",
  });

  // =========================================
  // OBTENER PRODUCTOS
  // =========================================
  useEffect(() => {
    recargar();
    obtenerCategorias();
  }, []);

  // =========================================
  // OBTENER CATEGORÍAS
  // =========================================
  const obtenerCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    setCategorias(data);
  };

  // =========================================
  // RECARGAR PRODUCTOS
  // =========================================
  const recargar = () => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        const adaptados = data.map((item) => {
          const stock = parseInt(item.stock) || 0;

          return {
            ...item,
            fechaSalida: "Sin salida",
            estado:
              stock > 15 ? "alto" : stock > 5 ? "medio" : "bajo",
            imagen: item.imagen || img1,
          };
        });

        setProductos(adaptados);
      });
  };

  // =========================================
  // BUSCADOR
  // =========================================
  const normalizar = (texto = "") =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtrados = productos.filter((p) => {
    const texto = normalizar(busqueda);

    return (
      (normalizar(p.nombre).includes(texto) ||
        normalizar(String(p.id)).includes(texto) ||
        normalizar(p.usuario || "").includes(texto)) &&
      (filtroEstado === "todos" || p.estado === filtroEstado)
    );
  });

  // =========================================
  // ESTADOS
  // =========================================
  const getEstado = (estado) => {
    if (estado === "alto")
      return <span className="badge bg-success">Stock Alto</span>;

    if (estado === "medio")
      return <span className="badge bg-warning text-dark">Stock Medio</span>;

    return <span className="badge bg-danger">Stock Bajo</span>;
  };

  // =========================================
  // AGREGAR / EDITAR
  // =========================================
  const agregarProducto = async (e) => {
    e.preventDefault();

    const producto = {
      nombre: nuevoProducto.nombre,

      // USUARIO AUTOMÁTICO
      usuario:
        usuarioLogueado?.nombre ||
        usuarioLogueado?.username ||
        "Usuario",

      // ROL AUTOMÁTICO
      rol: usuarioLogueado?.rol || "mecanico",

      fechaEntrada: nuevoProducto.fechaEntrada,
      stock: nuevoProducto.stock,
      imagen: nuevoProducto.imagen || "",
      id_categoria: parseInt(nuevoProducto.id_categoria),
    };

    if (modoEdicion) {
      await fetch(`${API}/${productoEditar.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      });
    } else {
      await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      });
    }

    recargar();

    setMostrarModal(false);
    setModoEdicion(false);
    setProductoEditar(null);

    setNuevoProducto({
      id: "",
      nombre: "",
      fechaEntrada: "",
      stock: "",
      imagen: "",
      id_categoria: "",
    });
  };

  // =========================================
  // ELIMINAR
  // =========================================
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;

    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    recargar();
  };

  // =========================================
  // EDITAR
  // =========================================
  const editarProducto = (producto) => {
    setNuevoProducto(producto);
    setProductoEditar(producto);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  return (
    <div className="p-5" style={{ marginTop: "1px" }}>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Gestión de Inventario</h4>

          <p className="text-muted">
            Administra productos de vehículos blindados
          </p>
        </div>

        <button
          onClick={() => {
            setModoEdicion(false);
            setMostrarModal(true);
          }}
          className="btn rounded-pill"
          style={{ backgroundColor: "#b89b6a" }}
        >
          + Agregar Producto
        </button>
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4">
        <h6 className="fw-bold mb-2">Filtros y Búsqueda</h6>

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
       <table
  className="table align-middle"
  style={{
    tableLayout: "fixed",
    width: "100%",
  }}
>
          <thead>
            <tr>
              <th>N° Parte</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td className="d-flex align-items-center gap-2">
                  <img
                    src={p.imagen}
                    alt=""
                    style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  {p.id}
                </td>

                <td>{p.nombre}</td>

                <td>
                  {
                    categorias.find(
                      (c) => c.id_categoria == p.id_categoria
                    )?.nombre_categoria || "Sin categoría"
                  }
                </td>

                <td>{p.usuario}</td>

                <td>
                  <span className="badge bg-dark">
                    {p.rol}
                  </span>
                </td>

                <td>{p.fechaEntrada}</td>
                <td>{p.fechaSalida}</td>
                <td className="fw-bold">{p.stock}</td>
                <td>{getEstado(p.estado)}</td>

                <td className="d-flex gap-3">

                  <Eye
                    size={18}
                    style={{ cursor: "pointer" }}
                    onClick={() => setVerProducto(p)}
                  />

                  <Pencil
                    size={18}
                    style={{ cursor: "pointer" }}
                    onClick={() => editarProducto(p)}
                  />

                  <Trash2
                    size={18}
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => eliminarProducto(p.id)}
                  />

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 👁 MODAL VER */}
      {verProducto && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">

          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: "350px" }}
          >

            <h5 className="fw-bold mb-3">
              Detalle del Producto
            </h5>

            <img
              src={verProducto.imagen}
              alt=""
              style={{
                width: "100%",
                borderRadius: "10px",
              }}
            />

            <p><strong>Nombre:</strong> {verProducto.nombre}</p>

            <p>
              <strong>Categoría:</strong>{" "}
              {
                categorias.find(
                  (c) =>
                    c.id_categoria == verProducto.id_categoria
                )?.nombre_categoria
              }
            </p>

            <p><strong>Usuario:</strong> {verProducto.usuario}</p>

            <p>
              <strong>Rol:</strong> {verProducto.rol}
            </p>

            <p><strong>Entrada:</strong> {verProducto.fechaEntrada}</p>
            <p><strong>Salida:</strong> {verProducto.fechaSalida}</p>
            <p><strong>Stock:</strong> {verProducto.stock}</p>
            <p><strong>Estado:</strong> {getEstado(verProducto.estado)}</p>

            <button
              onClick={() => setVerProducto(null)}
              className="btn btn-secondary w-100 mt-2"
            >
              Cerrar
            </button>

          </div>
        </div>
      )}

      {/* MODAL AGREGAR/EDITAR */}
      {mostrarModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">

          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: "400px" }}
          >

            <h5 className="fw-bold mb-3">
              {modoEdicion
                ? "Editar Producto"
                : "Agregar Producto"}
            </h5>

            <form onSubmit={agregarProducto}>

              <input
                className="form-control mb-2"
                placeholder="Nombre"
                value={nuevoProducto.nombre}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    nombre: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className="form-control mb-2"
                value={nuevoProducto.fechaEntrada}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    fechaEntrada: e.target.value,
                  })
                }
              />

              <input
                type="number"
                className="form-control mb-2"
                placeholder="Stock"
                value={nuevoProducto.stock}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    stock: e.target.value,
                  })
                }
              />

              {/* CATEGORÍAS */}
              <select
                className="form-select mb-2"
                value={nuevoProducto.id_categoria}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    id_categoria: e.target.value,
                  })
                }
              >
                <option value="">
                  Seleccione categoría
                </option>

                {categorias.map((cat) => (
                  <option
                    key={cat.id_categoria}
                    value={cat.id_categoria}
                  >
                    {cat.nombre_categoria}
                  </option>
                ))}
              </select>

              <div className="d-flex justify-content-end gap-2">

                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn"
                  style={{ backgroundColor: "#b89b6a" }}
                >
                  Guardar
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