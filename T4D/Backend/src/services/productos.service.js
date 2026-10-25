const supabase = require("../config/supabase");
const cloudinary = require("../config/cloudinary");

const SELECT_PRODUCTO =
  "*, categorias(nombre_categoria), proveedores(nombre_proveedor, nit), sucursales(nombre_sucursal, ciudad)";

// =====================================
// OBTENER PRODUCTOS
// =====================================

const obtenerProductos = async () => {
  const { data, error } = await supabase
    .from("productos")
    .select(SELECT_PRODUCTO)
    .eq("activo", true)
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

  const payload = { activo: true, ...producto };

  const { data, error } = await supabase
    .from("productos")
    .insert([payload])
    .select(SELECT_PRODUCTO);

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
    .select(SELECT_PRODUCTO);

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

  if (!error) return { desactivado: false };

  // 23503 = tiene movimientos / asignaciones asociadas -> borrado lógico
  if (error.code === "23503") {
    const { error: errorUpdate } = await supabase
      .from("productos")
      .update({ activo: false })
      .eq("id_producto", id);

    if (errorUpdate) throw errorUpdate;
    return { desactivado: true };
  }

  throw error;
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
    .select(SELECT_PRODUCTO);

  console.log("Respuesta Supabase:", data);
  console.log("Error Supabase:", error);

  if (error) {
    throw error;
  }

  return data;
};

// =====================================
// CLOUDINARY: SUBIR IMAGEN (desde buffer en memoria)
// =====================================

const subirImagenCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "productos",
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => (error ? reject(error) : resolve(result))
      )
      .end(buffer);
  });

// =====================================
// CLOUDINARY: sacar el public_id a partir de la URL guardada
// https://res.cloudinary.com/<cloud>/image/upload/v123/productos/abc.jpg
// => "productos/abc"
// =====================================

const extraerPublicId = (url) => {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("res.cloudinary.com")) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

// =====================================
// CLOUDINARY: BORRAR IMAGEN (best effort, nunca lanza error)
// =====================================

const eliminarImagenCloudinary = async (url) => {
  const publicId = extraerPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("ERROR BORRANDO IMAGEN CLOUDINARY:", error);
  }
};

// =====================================
// Helper: trae la URL de imagen actual de un producto
// =====================================

const obtenerImagenProducto = async (id) => {
  const { data, error } = await supabase
    .from("productos")
    .select("imagen")
    .eq("id_producto", id)
    .single();

  if (error) throw error;
  return data?.imagen || null;
};

module.exports = {
  obtenerProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto,
  actualizarParcialProducto,
  subirImagenCloudinary,
  eliminarImagenCloudinary,
  obtenerImagenProducto,
};