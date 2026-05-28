import { useState, useMemo, useEffect } from "react";

import {
  obtenerProveedores,
  crearProveedor,
  editarProveedorApi,
  eliminarProveedorApi,
} from "../../api/proveedoresApi";

import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building2,
  X,
  Save,
} from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  marginBottom: 12,
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  background: "#fafafa",
  color: "#111827",
};

const PROVEEDOR_VACIO = {
  id_proveedor: null,
  nit: "",
  nombre_proveedor: "",
  telefono: "",
  email: "",
  direccion: "",
  contacto_proveedor: "",
};

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [verProveedor, setVerProveedor] = useState(null);
  const [nuevoProveedor, setNuevoProveedor] =
    useState(PROVEEDOR_VACIO);

  const [error, setError] = useState(null);

  // =====================================
  // CARGAR PROVEEDORES
  // =====================================

  const cargarProveedores = async () => {
    try {
      setCargando(true);

      const data =
        await obtenerProveedores();

      setProveedores(data || []);

    } catch (error) {

      setError(
        "Error al cargar proveedores"
      );

    } finally {

      setCargando(false);

    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  // =====================================
  // FILTRAR
  // =====================================

  const filtrados = useMemo(() => {

    const q = busqueda.toLowerCase();

    if (!q) return proveedores;

    return proveedores.filter(
      (p) =>
        p.nombre_proveedor
          ?.toLowerCase()
          .includes(q) ||
        p.email
          ?.toLowerCase()
          .includes(q)
    );

  }, [proveedores, busqueda]);

  // =====================================
  // GUARDAR
  // =====================================

  const guardarProveedor =
    async (e) => {

      e.preventDefault();

      try {

        const payload = {
          nit: nuevoProveedor.nit,
          nombre_proveedor:
            nuevoProveedor.nombre_proveedor,
          telefono:
            nuevoProveedor.telefono,
          email:
            nuevoProveedor.email,
          direccion:
            nuevoProveedor.direccion,
          contacto_proveedor:
            nuevoProveedor.contacto_proveedor,
        };

        if (modoEdicion) {

          await editarProveedorApi(
            proveedorEditar.id_proveedor,
            payload
          );

        } else {

          await crearProveedor(
            payload
          );

        }

        await cargarProveedores();

        cerrarModal();

      } catch (error) {

        setError(
          "Error al guardar proveedor"
        );

      }
    };

  // =====================================
  // EDITAR
  // =====================================

  const editarProveedor = (
    proveedor
  ) => {

    setModoEdicion(true);

    setProveedorEditar(
      proveedor
    );

    setNuevoProveedor(
      proveedor
    );

    setMostrarModal(true);
  };

  // =====================================
  // ELIMINAR
  // =====================================

  const eliminarProveedor =
    async (id) => {

      const confirmar =
        window.confirm(
          "¿Eliminar proveedor?"
        );

      if (!confirmar) return;

      try {

        await eliminarProveedorApi(
          id
        );

        await cargarProveedores();

      } catch (error) {

        setError(
          "Error al eliminar proveedor"
        );

      }
    };

  // =====================================
  // CERRAR MODAL
  // =====================================

  const cerrarModal = () => {

    setMostrarModal(false);

    setModoEdicion(false);

    setProveedorEditar(null);

    setNuevoProveedor(
      PROVEEDOR_VACIO
    );
  };

  // =====================================
  // CAMPOS
  // =====================================

  const campos = [
    ["nit", "NIT"],
    [
      "nombre_proveedor",
      "Nombre",
    ],
    ["telefono", "Teléfono"],
    ["email", "Correo"],
    ["direccion", "Dirección"],
    [
      "contacto_proveedor",
      "Contacto",
    ],
  ];

  return (
    <div
      className="p-5"
      style={{
        marginTop: "1px",
        background: "#fff",
        minHeight: "100vh",
      }}
    >

      <div className="d-flex justify-content-between align-items-center mb-3">

        <div>

          <h4 className="fw-bold mb-1">
            Gestión de Proveedores
          </h4>

          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor:
                "#B89B6A",
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
            Gestiona los proveedores
          </p>

        </div>

        <button
          className="btn rounded-pill btn-sm"
          style={{
            backgroundColor:
              "#B89B6A",
            color: "#000",
            border: "none",
          }}
          onClick={() => {
            setModoEdicion(false);
            setMostrarModal(true);
          }}
        >
          <Plus size={16} />
          Agregar
        </button>

      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card p-3 rounded-4 shadow-sm mb-4">

        <div
          style={{
            position: "relative",
          }}
        >

          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform:
                "translateY(-50%)",
            }}
          >
            <Search size={14} />
          </span>

          <input
            type="text"
            className="form-control rounded-pill"
            style={{
              paddingLeft: 36,
            }}
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
          />

        </div>
      </div>

      <div className="card p-3 rounded-4 shadow-sm">

        {cargando ? (

          <div>
            Cargando...
          </div>

        ) : (

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>NIT</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {filtrados.map((p) => (

                <tr
                  key={
                    p.id_proveedor
                  }
                >

                  <td>
                    {p.id_proveedor}
                  </td>

                  <td>
                    {p.nit}
                  </td>

                  <td>
                    {
                      p.nombre_proveedor
                    }
                  </td>

                  <td>
                    {p.email}
                  </td>

                  <td>

                    <div className="d-flex gap-2">

                      <Eye
                        size={18}
                        style={{
                          cursor:
                            "pointer",
                        }}
                        onClick={() =>
                          setVerProveedor(
                            p
                          )
                        }
                      />

                      <Pencil
                        size={18}
                        style={{
                          cursor:
                            "pointer",
                        }}
                        onClick={() =>
                          editarProveedor(
                            p
                          )
                        }
                      />

                      <Trash2
                        size={18}
                        style={{
                          cursor:
                            "pointer",
                            color:
                              "red",
                        }}
                        onClick={() =>
                          eliminarProveedor(
                            p.id_proveedor
                          )
                        }
                      />

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}
      </div>
    </div>
  );
}