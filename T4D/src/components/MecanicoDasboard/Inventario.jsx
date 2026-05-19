import { useState, useEffect } from "react";
<<<<<<< HEAD
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";

import {
  obtenerProductosApi,
  agregarProductoApi,
  editarProductoApi,
  eliminarProductoApi,
} from "../../api/inventarioApi";

import img1 from "../../assets/img1.jpg";

function Inventario() {

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [mostrarModal, setMostrarModal] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);

=======
import { Eye, Pencil, Trash2 } from "lucide-react";
import img1 from "../../assets/img1.jpg";

import { supabase } from "../../supabase/supabaseClient";

function Inventario() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarModal, setMostrarModal] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);
>>>>>>> Juan_p
  const [productoEditar, setProductoEditar] = useState(null);

  const [productos, setProductos] = useState([]);

<<<<<<< HEAD
  const [verProducto, setVerProducto] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    stock: "",
    imagen: "",
=======
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
>>>>>>> Juan_p
  });

  // =========================================
  // OBTENER PRODUCTOS
  // =========================================
<<<<<<< HEAD

  useEffect(() => {

    obtenerProductos();

  }, []);

  const obtenerProductos = async () => {

    try {

      const data = await obtenerProductosApi();

      const adaptados = data.map((item) => {

        const stock =
          parseInt(item.stock_actual) || 0;

        return {
          id: item.id_producto,

          nombre: item.nombre_producto,

          descripcion:
            item.descripcion || "Sin descripción",

          fechaEntrada: item.created_at
            ? item.created_at.split("T")[0]
            : "Sin fecha",

          fechaSalida: "Sin salida",

          stock: stock,

          estado:
            stock > 15
              ? "alto"
              : stock > 5
              ? "medio"
              : "bajo",

          imagen: item.imagen || img1,
        };

      });

      setProductos(adaptados);

    } catch (error) {

      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los productos",
      });

    }

  };

  // =========================================
  // NORMALIZAR
  // =========================================

=======
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
>>>>>>> Juan_p
  const normalizar = (texto = "") =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

<<<<<<< HEAD
  // =========================================
  // FILTROS
  // =========================================

  const filtrados = productos.filter((p) => {

    const texto = normalizar(busqueda);

    return (
      (
        normalizar(p.nombre).includes(texto) ||
        normalizar(String(p.id)).includes(texto) ||
        normalizar(p.descripcion).includes(texto)
      ) &&
      (
        filtroEstado === "todos" ||
        p.estado === filtroEstado
      )
    );

=======
  const filtrados = productos.filter((p) => {
    const texto = normalizar(busqueda);

    return (
      (normalizar(p.nombre).includes(texto) ||
        normalizar(String(p.id)).includes(texto) ||
        normalizar(p.usuario || "").includes(texto)) &&
      (filtroEstado === "todos" || p.estado === filtroEstado)
    );
>>>>>>> Juan_p
  });

  // =========================================
  // ESTADOS
  // =========================================
<<<<<<< HEAD

  const getEstado = (estado) => {

    const estilos = {

      alto: {
        background: "#B89B6A",
        color: "#000",
      },

      medio: {
        background: "#374151",
        color: "#fff",
      },

      bajo: {
        background: "#1f2937",
        color: "#fff",
      },

    };

    return (

      <span
        style={{
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "11px",
          textTransform: "capitalize",
          ...estilos[estado],
        }}
      >
        {estado}
      </span>

    );

  };

  // =========================================
  // RECARGAR
  // =========================================

  const recargar = async () => {

    obtenerProductos();

  };

  // =========================================
  // LIMPIAR FORMULARIO
  // =========================================

  const limpiarFormulario = () => {

    setNuevoProducto({
      nombre: "",
      descripcion: "",
      stock: "",
      imagen: "",
    });

    setModoEdicion(false);

    setProductoEditar(null);

=======
  const getEstado = (estado) => {
    if (estado === "alto")
      return <span className="badge bg-success">Stock Alto</span>;

    if (estado === "medio")
      return <span className="badge bg-warning text-dark">Stock Medio</span>;

    return <span className="badge bg-danger">Stock Bajo</span>;
>>>>>>> Juan_p
  };

  // =========================================
  // AGREGAR / EDITAR
  // =========================================
<<<<<<< HEAD

  const agregarProducto = async (e) => {

    e.preventDefault();

    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.descripcion ||
      !nuevoProducto.stock
    ) {

      return Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Completa todos los campos",
      });

    }

    try {

      // =====================================
      // EDITAR
      // =====================================

      if (modoEdicion) {

        await editarProductoApi(
          productoEditar.id,
          {
            nombre_producto:
              nuevoProducto.nombre,

            descripcion:
              nuevoProducto.descripcion,

            stock_actual:
              parseInt(nuevoProducto.stock),

            imagen:
              nuevoProducto.imagen,
          }
        );

        Swal.fire({
          icon: "success",
          title: "Producto actualizado",
          timer: 1500,
          showConfirmButton: false,
        });

      }

      // =====================================
      // AGREGAR
      // =====================================

      else {

        await agregarProductoApi({
          nombre_producto:
            nuevoProducto.nombre,

          descripcion:
            nuevoProducto.descripcion,

          stock_actual:
            parseInt(nuevoProducto.stock),

          imagen:
            nuevoProducto.imagen,

          activo: true,
        });

        Swal.fire({
          icon: "success",
          title: "Producto agregado",
          timer: 1500,
          showConfirmButton: false,
        });

      }

      recargar();

      setMostrarModal(false);

      limpiarFormulario();

    } catch (error) {

      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema",
      });

    }

=======
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
>>>>>>> Juan_p
  };

  // =========================================
  // ELIMINAR
  // =========================================
<<<<<<< HEAD

  const eliminarProducto = async (id) => {

    const confirmacion =
      await Swal.fire({
        icon: "warning",
        title: "¿Eliminar producto?",
        text: "Esta acción no se puede deshacer",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
      });

    if (!confirmacion.isConfirmed) return;

    try {

      await eliminarProductoApi(id);

      Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        timer: 1500,
        showConfirmButton: false,
      });

      recargar();

    } catch (error) {

      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar",
      });

    }

=======
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;

    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    recargar();
>>>>>>> Juan_p
  };

  // =========================================
  // EDITAR
  // =========================================
<<<<<<< HEAD

  const editarProducto = (producto) => {

    setNuevoProducto({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      stock: producto.stock,
      imagen: producto.imagen,
    });

    setProductoEditar(producto);

    setModoEdicion(true);

    setMostrarModal(true);

  };

  return (

    <div
      className="p-5"
      style={{
        marginTop: "1px",
        background: "#fff",
        minHeight: "100vh",
      }}
    >

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-3">

        <div>

          <h4 className="fw-bold mb-1">
            Gestión de Inventario
          </h4>

          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#B89B6A",
              borderRadius: "10px",
              marginBottom: "5px",
            }}
          />

          <p
            style={{
              color: "#6b7280",
              fontSize: "13px",
              margin: 0,
            }}
          >
            Administra productos de vehículos blindados
          </p>

=======
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
>>>>>>> Juan_p
        </div>

        <button
          onClick={() => {
<<<<<<< HEAD

            limpiarFormulario();

            setMostrarModal(true);

          }}
          className="btn rounded-pill btn-sm"
          style={{
            backgroundColor: "#B89B6A",
            color: "#000",
            border: "none",
          }}
        >
          <Plus size={16} className="me-1" />
          Agregar
        </button>

      </div>

      {/* FILTROS */}

      <div
        className="card p-3 rounded-4 shadow-sm mb-4"
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
        }}
      >

        <h6
          className="fw-bold mb-2"
          style={{ color: "#B89B6A" }}
        >
          Filtros y Búsqueda
        </h6>

        <div className="d-flex gap-3">

=======
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
>>>>>>> Juan_p
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar producto..."
            value={busqueda}
<<<<<<< HEAD
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
=======
            onChange={(e) => setBusqueda(e.target.value)}
>>>>>>> Juan_p
          />

          <select
            className="form-select rounded-pill"
            value={filtroEstado}
<<<<<<< HEAD
            onChange={(e) =>
              setFiltroEstado(e.target.value)
            }
            style={{ maxWidth: "200px" }}
          >
            <option value="todos">
              Todo el stock
            </option>

            <option value="alto">
              Stock Alto
            </option>

            <option value="medio">
              Stock Medio
            </option>

            <option value="bajo">
              Stock Bajo
            </option>

          </select>

        </div>

      </div>

      {/* TABLA */}

      <div className="card p-3 rounded-4 shadow-sm">

        <table className="table align-middle">

          <thead>

            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Descripción</th>
              <th>Entrada</th>
=======
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
>>>>>>> Juan_p
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
<<<<<<< HEAD

          </thead>

          <tbody>

            {filtrados.map((p) => (

              <tr key={p.id}>

                <td>

                  <div className="d-flex align-items-center gap-2">

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

                    <span>{p.id}</span>

                  </div>

=======
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
>>>>>>> Juan_p
                </td>

                <td>{p.nombre}</td>

<<<<<<< HEAD
                <td>{p.descripcion}</td>

                <td>{p.fechaEntrada}</td>

                <td className="fw-bold">
                  {p.stock}
                </td>

                <td>
                  {getEstado(p.estado)}
                </td>

                <td className="d-flex gap-2">

                  <Eye
                    size={18}
                    style={{
                      cursor: "pointer",
                      color: "#374151",
                    }}
                    onClick={() =>
                      setVerProducto(p)
                    }
=======
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
>>>>>>> Juan_p
                  />

                  <Pencil
                    size={18}
<<<<<<< HEAD
                    style={{
                      cursor: "pointer",
                      color: "#374151",
                    }}
                    onClick={() =>
                      editarProducto(p)
                    }
=======
                    style={{ cursor: "pointer" }}
                    onClick={() => editarProducto(p)}
>>>>>>> Juan_p
                  />

                  <Trash2
                    size={18}
<<<<<<< HEAD
                    style={{
                      cursor: "pointer",
                      color: "#ef4444",
                    }}
                    onClick={() =>
                      eliminarProducto(p.id)
                    }
                  />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL VER */}

      {verProducto && (

        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
=======
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
>>>>>>> Juan_p

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
<<<<<<< HEAD
                marginBottom: "10px",
              }}
            />

            <p>
              <strong>Nombre:</strong>{" "}
              {verProducto.nombre}
            </p>

            <p>
              <strong>Descripción:</strong>{" "}
              {verProducto.descripcion}
            </p>

            <p>
              <strong>Entrada:</strong>{" "}
              {verProducto.fechaEntrada}
            </p>

            <p>
              <strong>Stock:</strong>{" "}
              {verProducto.stock}
            </p>

            <button
              onClick={() =>
                setVerProducto(null)
              }
=======
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
>>>>>>> Juan_p
              className="btn btn-secondary w-100 mt-2"
            >
              Cerrar
            </button>

          </div>
<<<<<<< HEAD

        </div>

      )}

      {/* MODAL AGREGAR / EDITAR */}

      {mostrarModal && (

        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
=======
        </div>
      )}

      {/* MODAL AGREGAR/EDITAR */}
      {mostrarModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
>>>>>>> Juan_p

          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: "400px" }}
          >

            <h5 className="fw-bold mb-3">
<<<<<<< HEAD

              {modoEdicion
                ? "Editar Producto"
                : "Agregar Producto"}

=======
              {modoEdicion
                ? "Editar Producto"
                : "Agregar Producto"}
>>>>>>> Juan_p
            </h5>

            <form onSubmit={agregarProducto}>

              <input
                className="form-control mb-2"
<<<<<<< HEAD
                placeholder="Nombre del producto"
=======
                placeholder="Nombre"
>>>>>>> Juan_p
                value={nuevoProducto.nombre}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    nombre: e.target.value,
                  })
                }
              />

              <input
<<<<<<< HEAD
                className="form-control mb-2"
                placeholder="Descripción"
                value={nuevoProducto.descripcion}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    descripcion: e.target.value,
=======
                type="date"
                className="form-control mb-2"
                value={nuevoProducto.fechaEntrada}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    fechaEntrada: e.target.value,
>>>>>>> Juan_p
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

<<<<<<< HEAD
              <input
                className="form-control mb-3"
                placeholder="URL de imagen (opcional)"
                value={nuevoProducto.imagen}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    imagen: e.target.value,
                  })
                }
              />
=======
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
>>>>>>> Juan_p

              <div className="d-flex justify-content-end gap-2">

                <button
                  type="button"
<<<<<<< HEAD
                  onClick={() =>
                    setMostrarModal(false)
                  }
=======
                  onClick={() => setMostrarModal(false)}
>>>>>>> Juan_p
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn"
<<<<<<< HEAD
                  style={{
                    backgroundColor: "#B89B6A",
                    color: "#000",
                    border: "none",
                  }}
                >
                  {modoEdicion
                    ? "Actualizar"
                    : "Guardar"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

=======
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
>>>>>>> Juan_p
}

export default Inventario;