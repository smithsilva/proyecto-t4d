const supabase = require("../config/supabase");

// =====================================
// OBTENER PRODUCTOS
// =====================================

const obtenerProductos = async () => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("id_producto", { ascending: true });

  if (error) {
    console.error("ERROR SUPABASE GET:", error);
    throw error;
  }

  return data;
};

// =====================================
// AGREGAR PRODUCTO
// =====================================

const agregarProducto = async (producto) => {
  console.log("Producto a insertar:", producto);

  const { data, error } = await supabase
    .from("productos")
    .insert([producto])
    .select();

  console.log("Respuesta:", data);
  console.log("Error:", error);

  if (error) {
    throw error;
  }

  return data;
};

// =====================================
// EDITAR PRODUCTO
// =====================================

const editarProducto = async (id, producto) => {
  console.log("========== EDITAR PRODUCTO ==========");
  console.log("ID:", id);
  console.log("Datos:", producto);

  const { data, error } = await supabase
    .from("productos")
    .update(producto)
    .eq("id_producto", id)
    .select();

  console.log("Respuesta Supabase:", data);
  console.log("Error Supabase:", error);

  if (error) {
    throw error;
  }

  return data;
};

// =====================================
// ELIMINAR PRODUCTO
// =====================================

const eliminarProducto = async (id) => {
  console.log("Eliminando producto:", id);

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id_producto", id);

  console.log("Error:", error);

  if (error) {
    throw error;
  }

  return true;
};

// =====================================
// PATCH
// =====================================

const actualizarParcialProducto = async (id, datos) => {
  console.log("========== PATCH PRODUCTO ==========");
  console.log("ID:", id);
  console.log("Datos:", datos);

  const { data, error } = await supabase
    .from("productos")
    .update(datos)
    .eq("id_producto", id)
    .select();

  console.log("Respuesta Supabase:", data);
  console.log("Error Supabase:", error);

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