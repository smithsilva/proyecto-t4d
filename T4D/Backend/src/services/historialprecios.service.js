const supabase = require("../config/supabase");

// =====================================
// PRODUCTOS
// =====================================

const obtenerProductos = async () => {
  const { data, error } = await supabase
    .from("productos")
    .select("id_producto, nombre_producto, precio_actual, activo")
    .order("nombre_producto", { ascending: true });

  if (error) {
    console.error("ERROR SUPABASE GET PRODUCTOS:", error);
    throw error;
  }

  return data;
};

// Crea un producto nuevo y registra el precio inicial en el historial
const crearProducto = async ({ nombre_producto, precio_inicial, motivo }) => {
  const { data: producto, error: errorInsert } = await supabase
    .from("productos")
    .insert([{ nombre_producto, precio_actual: precio_inicial, activo: true }])
    .select()
    .single();

  if (errorInsert) {
    console.error("ERROR SUPABASE CREAR PRODUCTO:", errorInsert);
    throw errorInsert;
  }

  const { error: errorHistorial } = await supabase.from("historial_precios").insert([{
    id_producto: producto.id_producto,
    precio_anterior: 0,
    precio_nuevo: precio_inicial,
    motivo: motivo || "Creación de producto",
    fecha_cambio: new Date().toISOString(),
  }]);

  if (errorHistorial) {
    // rollback best-effort: si no se pudo registrar el historial, eliminamos el producto recién creado
    await supabase.from("productos").delete().eq("id_producto", producto.id_producto);
    console.error("ERROR SUPABASE HISTORIAL INICIAL:", errorHistorial);
    throw errorHistorial;
  }

  return producto;
};

// Edita nombre y/o precio de un producto. Si el precio cambia, exige motivo y registra historial.
const editarProducto = async (id, { nombre_producto, precio_nuevo, motivo }) => {
  const { data: productoActual, error: errorGet } = await supabase
    .from("productos")
    .select("id_producto, nombre_producto, precio_actual")
    .eq("id_producto", id)
    .single();

  if (errorGet) {
    console.error("ERROR SUPABASE OBTENER PRODUCTO:", errorGet);
    throw errorGet;
  }
  if (!productoActual) {
    const err = new Error("Producto no encontrado");
    err.status = 404;
    throw err;
  }

  const precioAnterior = Number(productoActual.precio_actual);
  const precioNumero   = precio_nuevo !== undefined ? Number(precio_nuevo) : precioAnterior;
  const cambioPrecio   = precio_nuevo !== undefined && precioNumero !== precioAnterior;
  const cambioNombre   = nombre_producto !== undefined && nombre_producto !== productoActual.nombre_producto;

  if (cambioPrecio && !motivo) {
    const err = new Error("El motivo es obligatorio cuando cambia el precio");
    err.status = 400;
    throw err;
  }

  const updates = {};
  if (cambioNombre) updates.nombre_producto = nombre_producto;
  if (cambioPrecio) updates.precio_actual = precioNumero;

  let productoActualizado = productoActual;

  if (Object.keys(updates).length > 0) {
    const { data, error: errorUpdate } = await supabase
      .from("productos")
      .update(updates)
      .eq("id_producto", id)
      .select()
      .single();

    if (errorUpdate) {
      console.error("ERROR SUPABASE EDITAR PRODUCTO:", errorUpdate);
      throw errorUpdate;
    }
    productoActualizado = data;
  }

  if (cambioPrecio) {
    const { error: errorHistorial } = await supabase.from("historial_precios").insert([{
      id_producto: id,
      precio_anterior: precioAnterior,
      precio_nuevo: precioNumero,
      motivo,
      fecha_cambio: new Date().toISOString(),
    }]);

    if (errorHistorial) {
      console.error("ERROR SUPABASE INSERTAR HISTORIAL:", errorHistorial);
      throw errorHistorial;
    }
  }

  return productoActualizado;
};

const cambiarEstadoProducto = async (id, activo) => {
  const { data, error } = await supabase
    .from("productos")
    .update({ activo })
    .eq("id_producto", id)
    .select()
    .single();

  if (error) {
    console.error("ERROR SUPABASE CAMBIAR ESTADO PRODUCTO:", error);
    throw error;
  }

  return data;
};

const eliminarProducto = async (id) => {
  const { error } = await supabase.from("productos").delete().eq("id_producto", id);

  if (error) {
    console.error("ERROR SUPABASE ELIMINAR PRODUCTO:", error);
    // Código típico de violación de FK en Postgres/Supabase
    if (error.code === "23503") {
      const err = new Error("No se puede eliminar: el producto tiene historial de precios asociado. Desactívalo en su lugar.");
      err.status = 409;
      throw err;
    }
    throw error;
  }

  return true;
};

// =====================================
// HISTORIAL DE PRECIOS
// =====================================

const obtenerHistorial = async () => {
  const { data, error } = await supabase
    .from("historial_precios")
    .select("*")
    .order("id_historial", { ascending: false });

  if (error) {
    console.error("ERROR SUPABASE GET HISTORIAL:", error);
    throw error;
  }

  return data;
};

const obtenerHistorialPorProducto = async (idProducto) => {
  const { data, error } = await supabase
    .from("historial_precios")
    .select("*")
    .eq("id_producto", idProducto)
    .order("id_historial", { ascending: false });

  if (error) {
    console.error("ERROR SUPABASE GET HISTORIAL POR PRODUCTO:", error);
    throw error;
  }

  return data;
};

const eliminarRegistroHistorial = async (id) => {
  const { error } = await supabase.from("historial_precios").delete().eq("id_historial", id);

  if (error) {
    console.error("ERROR SUPABASE ELIMINAR HISTORIAL:", error);
    throw error;
  }

  return true;
};

module.exports = {
  obtenerProductos,
  crearProducto,
  editarProducto,
  cambiarEstadoProducto,
  eliminarProducto,
  obtenerHistorial,
  obtenerHistorialPorProducto,
  eliminarRegistroHistorial,
};