import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Shield,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  Plus,
  Search,
} from "lucide-react";

import { supabase } from "../../supabase/supabaseClient";

function GestionCategorias() {
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);

  // =========================================
  // OBTENER CATEGORÍAS
  // =========================================
  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select(`
        id_categoria,
        nombre_categoria,
        descripcion,
        activo
      `)
      .order("id_categoria", { ascending: true });

    if (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las categorías",
      });

      return;
    }

    const formateadas = data.map((c, index) => ({
      id: c.id_categoria,
      codigo: `CAT-${String(index + 1).padStart(3, "0")}`,
      nombre: c.nombre_categoria,
      descripcion: c.descripcion,
      activo: c.activo,
      estado: c.activo ? "Activa" : "Inactiva",
    }));

    setCategorias(formateadas);
  };

  // =========================================
  // NUEVA CATEGORÍA
  // =========================================
  const nuevaCategoria = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Nueva Categoría",

      html: `
        <input
          id="swal-nombre"
          class="swal2-input"
          placeholder="Nombre de categoría"
        />
        <input
          id="swal-descripcion"
          class="swal2-input"
          placeholder="Descripción"
        />
      `,

      focusConfirm: false,
      confirmButtonText: "Crear",

      preConfirm: () => {
        return {
          nombre: document.getElementById("swal-nombre").value,
          descripcion: document.getElementById("swal-descripcion").value,
        };
      },
    });

    if (!formValues) return;

    const { error } = await supabase.from("categorias").insert({
      nombre_categoria: formValues.nombre,
      descripcion: formValues.descripcion,
      activo: true,
    });

    if (error) {
      Swal.fire("Error", "No se pudo crear la categoría", "error");
      return;
    }

    Swal.fire("Creada", "Categoría creada correctamente", "success");
    obtenerCategorias();
  };

  // =========================================
  // EDITAR CATEGORÍA
  // =========================================
  const editarCategoria = async (categoria) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Categoría",

      html: `
        <input
          id="swal-nombre"
          class="swal2-input"
          placeholder="Nombre"
          value="${categoria.nombre}"
        />
        <input
          id="swal-descripcion"
          class="swal2-input"
          placeholder="Descripción"
          value="${categoria.descripcion}"
        />
      `,

      focusConfirm: false,

      preConfirm: () => {
        return {
          nombre: document.getElementById("swal-nombre").value,
          descripcion: document.getElementById("swal-descripcion").value,
        };
      },
    });

    if (!formValues) return;

    const { error } = await supabase
      .from("categorias")
      .update({
        nombre_categoria: formValues.nombre,
        descripcion: formValues.descripcion,
      })
      .eq("id_categoria", categoria.id);

    if (error) {
      Swal.fire("Error", "No se pudo actualizar la categoría", "error");
      return;
    }

    Swal.fire(
      "Actualizada",
      "Categoría actualizada correctamente",
      "success"
    );

    obtenerCategorias();
  };

  // =========================================
  // ELIMINAR CATEGORÍA
  // =========================================
  const eliminarCategoria = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });

    if (!resultado.isConfirmed) return;

    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("id_categoria", id);

    if (error) {
      Swal.fire("Error", "No se pudo eliminar la categoría", "error");
      return;
    }

    Swal.fire(
      "Eliminada",
      "Categoría eliminada correctamente",
      "success"
    );

    obtenerCategorias();
  };

  // =========================================
  // BUSCADOR
  // =========================================
  const normalizar = (texto) =>
    texto
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtradas = categorias.filter((c) => {
    const texto = normalizar(busqueda);

    return (
      normalizar(c.nombre).includes(texto) ||
      normalizar(c.descripcion).includes(texto) ||
      normalizar(c.codigo).includes(texto)
    );
  });

  const totalActivas = categorias.filter((c) => c.activo).length;
  const totalInactivas = categorias.filter((c) => !c.activo).length;

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-1">Categorías de Blindaje</h5>

          <p
            className="text-muted mb-0"
            style={{ fontSize: "13px" }}
          >
            Gestión de niveles de protección balística
          </p>
        </div>

        <button
          className="btn d-flex align-items-center gap-2"
          style={{
            background: "#B89B6A",
            color: "#000",
            fontWeight: "600",
            fontSize: "13px",
            borderRadius: "8px",
          }}
          onClick={nuevaCategoria}
        >
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>

      {/* TARJETAS */}
      <div className="row g-2 mb-3">
        {/* TOTAL */}
        <div className="col-md-4">
          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-start"
            style={{
              background: "#121212",
              border: "1px solid #B89B6A",
              color: "#fff",
            }}
          >
            <div>
              <small style={{ color: "#B89B6A" }}>
                Total Categorías
              </small>

              <h4 className="fw-bold mb-0 mt-1">
                {categorias.length}
              </h4>

              <small style={{ color: "#9ca3af" }}>
                niveles registrados
              </small>
            </div>

            <Shield size={20} color="#B89B6A" />
          </div>
        </div>

        {/* ACTIVAS */}
        <div className="col-md-4">
          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-start"
            style={{
              background: "#121212",
              border: "1px solid #B89B6A",
              color: "#fff",
            }}
          >
            <div>
              <small style={{ color: "#B89B6A" }}>
                Activas
              </small>

              <h4 className="fw-bold mb-0 mt-1">
                {totalActivas}
              </h4>

              <small style={{ color: "#9ca3af" }}>
                en uso
              </small>
            </div>

            <CheckCircle size={20} color="#B89B6A" />
          </div>
        </div>

        {/* INACTIVAS */}
        <div className="col-md-4">
          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-start"
            style={{
              background: "#121212",
              border: "1px solid #B89B6A",
              color: "#fff",
            }}
          >
            <div>
              <small style={{ color: "#B89B6A" }}>
                Inactivas
              </small>

              <h4 className="fw-bold mb-0 mt-1">
                {totalInactivas}
              </h4>

              <small style={{ color: "#9ca3af" }}>
                deshabilitadas
              </small>
            </div>

            <XCircle size={20} color="#B89B6A" />
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <div
        className="card p-3 rounded-4 shadow-sm mb-3"
        style={{ background: "#fff" }}
      >
        <p className="fw-semibold mb-2" style={{ fontSize: "14px" }}>
          Búsqueda
        </p>

        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <Search size={15} color="#9ca3af" />
          </span>

          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Buscar categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ fontSize: "13px" }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div
        className="card p-3 rounded-4 shadow-sm"
        style={{ background: "#fff" }}
      >
        <div className="mb-3">
          <p className="fw-semibold mb-0" style={{ fontSize: "14px" }}>
            Categorías Registradas
          </p>

          <small className="text-muted">
            {filtradas.length} categorías
          </small>
        </div>

        <table className="table align-middle mb-0">
          <thead>
            <tr style={{ fontSize: "13px" }}>
              <th>ID</th>
              <th>Nombre Categoría</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtradas.map((c) => (
              <tr key={c.id} style={{ fontSize: "13px" }}>
                <td>
                  <span style={{ color: "#6b7280" }}>
                    {c.codigo}
                  </span>
                </td>

                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Shield size={14} color="#B89B6A" />

                    <span className="fw-semibold">
                      {c.nombre}
                    </span>
                  </div>
                </td>

                <td style={{ color: "#374151" }}>
                  {c.descripcion}
                </td>

                <td>
                  <span
                    className="badge d-flex align-items-center gap-1"
                    style={{
                      width: "fit-content",
                      background: c.activo
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: c.activo
                        ? "#16a34a"
                        : "#dc2626",
                      fontWeight: "500",
                      fontSize: "12px",
                    }}
                  >
                    {c.activo ? (
                      <CheckCircle size={11} />
                    ) : (
                      <XCircle size={11} />
                    )}

                    {c.estado}
                  </span>
                </td>

                <td className="d-flex gap-2">
                  {/* EDITAR */}
                  <button
                    className="btn btn-sm d-flex align-items-center justify-content-center"
                    style={{
                      width: "30px",
                      height: "30px",
                      background: "#f3f4f6",
                      border: "none",
                      borderRadius: "6px",
                    }}
                    onClick={() => editarCategoria(c)}
                  >
                    <Pencil size={14} color="#374151" />
                  </button>

                  {/* ELIMINAR */}
                  <button
                    className="btn btn-sm d-flex align-items-center justify-content-center"
                    style={{
                      width: "30px",
                      height: "30px",
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "6px",
                    }}
                    onClick={() => eliminarCategoria(c.id)}
                  >
                    <Trash2 size={14} color="#dc2626" />
                  </button>
                </td>
              </tr>
            ))}

            {filtradas.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-muted py-4"
                  style={{ fontSize: "13px" }}
                >
                  No se encontraron categorías
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GestionCategorias;