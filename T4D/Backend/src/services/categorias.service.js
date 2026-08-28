const supabase = require("../config/supabase");

// =====================================
// OBTENER CATEGORÍAS
// =====================================

const obtenerCategorias = async () => {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("id_categoria", { ascending: true });

  if (error) {
    console.error("ERROR SUPABASE GET CATEGORIAS:", error);
    throw error;
  }

  return data;
};

// =====================================
// AGREGAR CATEGORÍA
// =====================================

const agregarCategoria = async (categoria) => {
  const { data, error } = await supabase
    .from("categorias")
    .insert([categoria])
    .select();

  if (error) {
    console.error("ERROR SUPABASE POST CATEGORIA:", error);
    throw error;
  }

  return data;
};

// =====================================
// EDITAR CATEGORÍA (reemplazo completo)
// =====================================

const editarCategoria = async (id, categoria) => {
  const { data, error } = await supabase
    .from("categorias")
    .update(categoria)
    .eq("id_categoria", id)
    .select();

  if (error) {
    console.error("ERROR SUPABASE PUT CATEGORIA:", error);
    throw error;
  }

  return data;
};

// =====================================
// PATCH (edición parcial)
// =====================================

const actualizarParcialCategoria = async (id, datos) => {
  const { data, error } = await supabase
    .from("categorias")
    .update(datos)
    .eq("id_categoria", id)
    .select();

  if (error) {
    console.error("ERROR SUPABASE PATCH CATEGORIA:", error);
    throw error;
  }

  return data;
};

// =====================================
// ELIMINAR CATEGORÍA
// =====================================

const eliminarCategoria = async (id) => {
  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id_categoria", id);

  if (error) {
    console.error("ERROR SUPABASE DELETE CATEGORIA:", error);
    throw error;
  }

  return true;
};

module.exports = {
  obtenerCategorias,
  agregarCategoria,
  editarCategoria,
  actualizarParcialCategoria,
  eliminarCategoria,
};