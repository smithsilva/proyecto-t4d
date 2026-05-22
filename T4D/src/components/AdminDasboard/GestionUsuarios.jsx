import { useState, useEffect } from "react";
import Swal from "sweetalert2";

import {
  Eye,
  Pencil,
  Trash2,
  RefreshCcw,
  Users,
  Shield,
  Wrench,
  UserCheck,
} from "lucide-react";

import { supabase } from "../../supabase/supabaseClient";

function GestionUsuarios() {

  const [busqueda, setBusqueda] =
    useState("");

  const [usuarios, setUsuarios] =
    useState([]);

  // =========================================
  // OBTENER USUARIOS
  // =========================================

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios =
    async () => {

      const { data, error } =
        await supabase
          .from("usuarios")
          .select(`
            id_usuario,
            username,
            email,
            activo,
            roles (
              nombre_rol
            )
          `);

      if (error) {

        console.log(error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            "No se pudieron cargar los usuarios",
        });

        return;
      }

      const usuariosFormateados =
        data.map((u) => ({

          id: u.id_usuario,

          nombre:
            u.username,

          correo:
            u.email,

          rol:
            u.roles?.nombre_rol ||
            "Sin rol",

          estado:
            u.activo
              ? "activo"
              : "inactivo",

          activo:
            u.activo,

          iniciales:
            u.username
              ?.split(" ")
              .map((p) => p[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),

        }));

      setUsuarios(
        usuariosFormateados
      );
    };

  // =========================================
  // EDITAR USUARIO
  // =========================================

  const editarUsuario =
    async (usuario) => {

      const {
        value: formValues,
      } = await Swal.fire({

        title:
          "Editar Usuario",

        html: `
          <input
            id="swal-nombre"
            class="swal2-input"
            placeholder="Nombre"
            value="${usuario.nombre}"
          />

          <input
            id="swal-correo"
            class="swal2-input"
            placeholder="Correo"
            value="${usuario.correo}"
          />
        `,

        focusConfirm: false,

        preConfirm: () => {

          return {
            nombre:
              document.getElementById(
                "swal-nombre"
              ).value,

            correo:
              document.getElementById(
                "swal-correo"
              ).value,
          };
        },
      });

      if (!formValues)
        return;

      const { error } =
        await supabase
          .from("usuarios")
          .update({
            username:
              formValues.nombre,

            email:
              formValues.correo,
          })
          .eq(
            "id_usuario",
            usuario.id
          );

      if (error) {

        Swal.fire(
          "Error",
          "No se pudo actualizar el usuario",
          "error"
        );

        return;
      }

      Swal.fire(
        "Actualizado",
        "Usuario actualizado correctamente",
        "success"
      );

      obtenerUsuarios();
    };

  // =========================================
  // ACTIVAR / DESACTIVAR
  // =========================================

  const cambiarEstado =
    async (usuario) => {

      const nuevoEstado =
        !usuario.activo;

      const { error } =
        await supabase
          .from("usuarios")
          .update({
            activo:
              nuevoEstado,
          })
          .eq(
            "id_usuario",
            usuario.id
          );

      if (error) {

        Swal.fire(
          "Error",
          "No se pudo actualizar el estado",
          "error"
        );

        return;
      }

      Swal.fire(
        "Actualizado",
        `Usuario ${
          nuevoEstado
            ? "activado"
            : "desactivado"
        } correctamente`,
        "success"
      );

      obtenerUsuarios();
    };

  // =========================================
  // ELIMINAR USUARIO
  // =========================================

  const eliminarUsuario =
    async (id) => {

      const resultado =
        await Swal.fire({

          title:
            "¿Eliminar usuario?",

          text:
            "Esta acción no se puede deshacer",

          icon:
            "warning",

          showCancelButton:
            true,

          confirmButtonColor:
            "#d33",

          cancelButtonColor:
            "#3085d6",

          confirmButtonText:
            "Sí, eliminar",
        });

      if (
        !resultado.isConfirmed
      )
        return;

      const { error } =
        await supabase
          .from("usuarios")
          .delete()
          .eq(
            "id_usuario",
            id
          );

      if (error) {

        Swal.fire(
          "Error",
          "No se pudo eliminar el usuario",
          "error"
        );

        return;
      }

      Swal.fire(
        "Eliminado",
        "Usuario eliminado correctamente",
        "success"
      );

      obtenerUsuarios();
    };

  // =========================================
  // BUSCADOR
  // =========================================

  const normalizar =
    (texto) =>
      texto
        ?.toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );

  const filtrados =
    usuarios.filter((u) => {

      const texto =
        normalizar(busqueda);

      return (
        normalizar(
          u.nombre
        ).includes(texto) ||

        normalizar(
          u.correo
        ).includes(texto) ||

        normalizar(
          u.rol
        ).includes(texto)
      );
    });

  // =========================================
  // COLORES ROLES
  // =========================================

  const getRol = (rol) => {

    if (rol === "Admin") {

      return (
        <span
          className="badge"
          style={{
            background:
              "#B89B6A",

            color: "#000",
          }}
        >
          Admin
        </span>
      );
    }

    if (rol === "Gerente") {

      return (
        <span
          className="badge"
          style={{
            background:
              "#1f2937",
          }}
        >
          Gerente
        </span>
      );
    }

    if (rol === "Mecanico") {

      return (
        <span
          className="badge"
          style={{
            background:
              "#374151",
          }}
        >
          Mecánico
        </span>
      );
    }

    if (rol === "Contador") {

      return (
        <span
          className="badge"
          style={{
            background:
              "#e5e7eb",

            color: "#000",
          }}
        >
          Contador
        </span>
      );
    }

    return (
      <span
        className="badge"
        style={{
          background:
            "#6b7280",
        }}
      >
        {rol}
      </span>
    );
  };

  return (

    <div
      style={{
        padding: "20px",
        width: "100%",
        minHeight: "100vh",
        boxSizing:
          "border-box",
      }}
    >

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">

        <div>

          <h5 className="fw-bold mb-1">
            Gestión de Usuarios
          </h5>

          <p
            className="text-muted mb-0"
            style={{
              fontSize:
                "13px",
            }}
          >
            Administra los usuarios del sistema
          </p>

        </div>

      </div>

      {/* TARJETAS */}

      <div className="row g-3 mb-3">

        {/* TOTAL */}

        <div className="col-12 col-sm-6 col-lg-3">

          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
            style={{
              background:
                "#121212",

              border:
                "1px solid #B89B6A",

              color: "#fff",
            }}
          >

            <div>

              <small
                style={{
                  color:
                    "#B89B6A",
                }}
              >
                Total Usuarios
              </small>

              <h5 className="fw-bold mb-0">
                {usuarios.length}
              </h5>

            </div>

            <Users
              size={20}
              color="#B89B6A"
            />

          </div>
        </div>

        {/* ADMINS */}

        <div className="col-12 col-sm-6 col-lg-3">

          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
            style={{
              background:
                "#121212",

              border:
                "1px solid #B89B6A",

              color: "#fff",
            }}
          >

            <div>

              <small
                style={{
                  color:
                    "#B89B6A",
                }}
              >
                Administradores
              </small>

              <h5 className="fw-bold mb-0">
                {
                  usuarios.filter(
                    (u) =>
                      u.rol ===
                      "Admin"
                  ).length
                }
              </h5>

            </div>

            <Shield
              size={20}
              color="#B89B6A"
            />

          </div>
        </div>

        {/* MECANICOS */}

        <div className="col-12 col-sm-6 col-lg-3">

          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
            style={{
              background:
                "#121212",

              border:
                "1px solid #B89B6A",

              color: "#fff",
            }}
          >

            <div>

              <small
                style={{
                  color:
                    "#B89B6A",
                }}
              >
                Mecánicos
              </small>

              <h5 className="fw-bold mb-0">
                {
                  usuarios.filter(
                    (u) =>
                      u.rol ===
                      "Mecanico"
                  ).length
                }
              </h5>

            </div>

            <Wrench
              size={20}
              color="#B89B6A"
            />

          </div>
        </div>

        {/* OTROS */}

        <div className="col-12 col-sm-6 col-lg-3">

          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
            style={{
              background:
                "#121212",

              border:
                "1px solid #B89B6A",

              color: "#fff",
            }}
          >

            <div>

              <small
                style={{
                  color:
                    "#B89B6A",
                }}
              >
                Otros Roles
              </small>

              <h5 className="fw-bold mb-0">
                {
                  usuarios.filter(
                    (u) =>
                      u.rol !==
                        "Admin" &&
                      u.rol !==
                        "Mecanico"
                  ).length
                }
              </h5>

            </div>

            <UserCheck
              size={20}
              color="#B89B6A"
            />

          </div>
        </div>
      </div>

      {/* BUSCADOR */}

      <div
        className="card p-3 rounded-4 shadow-sm mb-3"
        style={{
          background:
            "#fff",
          width: "100%",
        }}
      >

        <input
          type="text"
          className="form-control rounded-pill"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
        />

      </div>

      {/* TABLA */}

      <div
        className="card p-3 rounded-4 shadow-sm mb-3"
        style={{
          background:
            "#fff",
          width: "100%",
        }}
      >

        <div className="table-responsive">

          <table
            className="table align-middle mb-0"
            style={{
              minWidth:
                "850px",
            }}
          >

            <thead>

              <tr
                style={{
                  fontSize:
                    "13px",
                }}
              >

                <th>
                  Usuario
                </th>

                <th>
                  Correo
                </th>

                <th>
                  Rol
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Acciones
                </th>

              </tr>
            </thead>

            <tbody>

              {filtrados.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-5 text-muted"
                  >
                    No se encontraron usuarios
                  </td>

                </tr>

              ) : (

                filtrados.map((u) => (

                  <tr
                    key={u.id}
                    style={{
                      fontSize:
                        "13px",
                    }}
                  >

                    <td>

                      <div className="d-flex align-items-center gap-2">

                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center fw-bold"
                          style={{
                            width:
                              "32px",

                            height:
                              "32px",

                            backgroundColor:
                              "#B89B6A",

                            color:
                              "#000",

                            flexShrink: 0,
                          }}
                        >
                          {u.iniciales}
                        </div>

                        <span className="fw-semibold">
                          {u.nombre}
                        </span>

                      </div>
                    </td>

                    <td>
                      {u.correo}
                    </td>

                    <td>
                      {getRol(u.rol)}
                    </td>

                    <td>

                      <span
                        className="badge"
                        style={{
                          background:
                            u.estado ===
                            "activo"
                              ? "#B89B6A"
                              : "#1f2937",

                          color:
                            u.estado ===
                            "activo"
                              ? "#000"
                              : "#fff",
                        }}
                      >
                        {u.estado}
                      </span>

                    </td>

                    <td>

                      <div className="d-flex gap-2 align-items-center">

                        {/* VER */}

                        <Eye
                          size={16}
                          style={{
                            cursor:
                              "pointer",
                          }}
                        />

                        {/* EDITAR */}

                        <Pencil
                          size={16}
                          style={{
                            cursor:
                              "pointer",
                          }}
                          onClick={() =>
                            editarUsuario(
                              u
                            )
                          }
                        />

                        {/* ACTIVAR / DESACTIVAR */}

                        <RefreshCcw
                          size={16}
                          style={{
                            cursor:
                              "pointer",

                            color:
                              u.activo
                                ? "#f59e0b"
                                : "#22c55e",
                          }}
                          onClick={() =>
                            cambiarEstado(
                              u
                            )
                          }
                        />

                        {/* ELIMINAR */}

                        <Trash2
                          size={16}
                          style={{
                            cursor:
                              "pointer",

                            color:
                              "red",
                          }}
                          onClick={() =>
                            eliminarUsuario(
                              u.id
                            )
                          }
                        />

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GestionUsuarios;