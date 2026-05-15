import { useState, useEffect } from "react";
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

  const [productoEditar, setProductoEditar] = useState(null);

  const [productos, setProductos] = useState([]);

  const [verProducto, setVerProducto] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    stock: "",
    imagen: "",
  });

  // =========================================
  // OBTENER PRODUCTOS
  // =========================================

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

  const normalizar = (texto = "") =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

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

  });

  // =========================================
  // ESTADOS
  // =========================================

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

  };

  // =========================================
  // AGREGAR / EDITAR
  // =========================================

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

  };

  // =========================================
  // ELIMINAR
  // =========================================

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

  };

  // =========================================
  // EDITAR
  // =========================================

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

        </div>

        <button
          onClick={() => {

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

          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
          />

          <select
            className="form-select rounded-pill"
            value={filtroEstado}
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
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>

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

                </td>

                <td>{p.nombre}</td>

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
                  />

                  <Pencil
                    size={18}
                    style={{
                      cursor: "pointer",
                      color: "#374151",
                    }}
                    onClick={() =>
                      editarProducto(p)
                    }
                  />

                  <Trash2
                    size={18}
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
              className="btn btn-secondary w-100 mt-2"
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
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >

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
                placeholder="Nombre del producto"
                value={nuevoProducto.nombre}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    nombre: e.target.value,
                  })
                }
              />

              <input
                className="form-control mb-2"
                placeholder="Descripción"
                value={nuevoProducto.descripcion}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    descripcion: e.target.value,
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

              <div className="d-flex justify-content-end gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setMostrarModal(false)
                  }
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn"
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

}

export default Inventario;