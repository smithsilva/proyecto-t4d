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
      .from("categorias_blindaje")
      .select(`
        id_categoria,
        nombre_categoria,
        descripcion,
        activo
      `)
      .order("id_categoria", { ascending: true });

    if (error) {
      console.log(error);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar las categorías" });
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
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre de categoría" />
        <input id="swal-descripcion" class="swal2-input" placeholder="Descripción" />
      `,
      focusConfirm: false,
      confirmButtonText: "Crear",
      preConfirm: () => ({
        nombre: document.getElementById("swal-nombre").value,
        descripcion: document.getElementById("swal-descripcion").value,
      }),
    });

    if (!formValues) return;

    const { error } = await supabase
      .from("categorias_blindaje")
      .insert({ nombre_categoria: formValues.nombre, descripcion: formValues.descripcion, activo: true });

    if (error) { Swal.fire("Error", "No se pudo crear la categoría", "error"); return; }
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
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${categoria.nombre}" />
        <input id="swal-descripcion" class="swal2-input" placeholder="Descripción" value="${categoria.descripcion}" />
      `,
      focusConfirm: false,
      preConfirm: () => ({
        nombre: document.getElementById("swal-nombre").value,
        descripcion: document.getElementById("swal-descripcion").value,
      }),
    });

    if (!formValues) return;

    const { error } = await supabase
      .from("categorias_blindaje")
      .update({ nombre_categoria: formValues.nombre, descripcion: formValues.descripcion })
      .eq("id_categoria", categoria.id);

    if (error) { Swal.fire("Error", "No se pudo actualizar la categoría", "error"); return; }
    Swal.fire("Actualizada", "Categoría actualizada correctamente", "success");
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
      .from("categorias_blindaje")
      .delete()
      .eq("id_categoria", id);

    if (error) { Swal.fire("Error", "No se pudo eliminar la categoría", "error"); return; }
    Swal.fire("Eliminada", "Categoría eliminada correctamente", "success");
    obtenerCategorias();
  };

  // =========================================
  // BUSCADOR
  // =========================================
  const normalizar = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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
      className="p-5"
      style={{ background: "#fff", minHeight: "100vh" }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Categorías de Blindaje</h4>
          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#B89B6A",
              borderRadius: "10px",
              marginBottom: "5px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Gestión de niveles de protección balística
          </p>
        </div>
        <button
          onClick={nuevaCategoria}
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}
        >
          <Plus size={16} className="me-1" />
          Nueva Categoría
        </button>
      </div>

      {/* CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Total Categorías</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={18} color="#B89B6A" />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#B89B6A" }}>{categorias.length}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>niveles registrados</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Activas</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={18} color="#B89B6A" />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#374151" }}>{totalActivas}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>en uso</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Inactivas</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <XCircle size={18} color="#B89B6A" />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#1f2937" }}>{totalInactivas}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>deshabilitadas</div>
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Filtros y Búsqueda</h6>
        <div style={{ position: "relative" }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: "38px", fontSize: "13px" }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <div className="mb-3">
          <p className="fw-semibold mb-0" style={{ fontSize: "14px" }}>Categorías Registradas</p>
          <small className="text-muted">{filtradas.length} categorías</small>
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
                <td><span style={{ color: "#6b7280" }}>{c.codigo}</span></td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Shield size={14} color="#B89B6A" />
                    <span className="fw-semibold">{c.nombre}</span>
                  </div>
                </td>
                <td style={{ color: "#374151" }}>{c.descripcion}</td>
                <td>
                  <span
                    className="badge d-flex align-items-center gap-1"
                    style={{
                      width: "fit-content",
                      background: c.activo ? "#dcfce7" : "#fee2e2",
                      color: c.activo ? "#16a34a" : "#dc2626",
                      fontWeight: "500",
                      fontSize: "12px",
                    }}
                  >
                    {c.activo ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {c.estado}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => editarCategoria(c)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e8d5b7", background: "#fdf8f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Pencil size={14} color="#B89B6A" />
                    </button>
                    <button
                      onClick={() => eliminarCategoria(c.id)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Trash2 size={14} color="#dc2626" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4" style={{ fontSize: "13px" }}>
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