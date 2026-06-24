const supabase = require("../config/supabase");

// =====================================
// OBTENER PRODUCTOS
// =====================================

const obtenerProductos = async () => {

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("id_producto", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data;
};

// =====================================
// AGREGAR PRODUCTO
// =====================================

const agregarProducto = async (producto) => {

  const { data, error } = await supabase
    .from("productos")
    .insert([producto])
    .select();

  if (error) {
    throw error;
  }

  return data;
};

// =====================================
// EDITAR PRODUCTO
// =====================================

const editarProducto = async (
  id,
  producto
) => {

  const { data, error } = await supabase
    .from("productos")
    .update(producto)
    .eq("id_producto", id)
    .select();

  if (error) {
    throw error;
  }

  return data;
};

// =====================================
// ELIMINAR PRODUCTO
// =====================================

const eliminarProducto = async (id) => {

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id_producto", id);

  if (error) {
    throw error;
  }

  return true;
};

const actualizarParcialProducto = async (id, datos) => {
  const { data, error } = await supabase
    .from("productos")
    .update(datos)
    .eq("id_producto", id)
    .select();

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  obtenerProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto,
  actualizarParcialProducto,
};