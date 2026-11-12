const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { insertar, actualizar } = require("../utils/sql");

// Producto con sus relaciones anidadas (igual que el select de Supabase)
const SELECT_PRODUCTO = `
  SELECT p.*,
    CASE WHEN c.id_categoria IS NULL THEN NULL ELSE json_build_object(
      'nombre_categoria', c.nombre_categoria
    ) END AS categorias,
    CASE WHEN pr.id_proveedor IS NULL THEN NULL ELSE json_build_object(
      'nombre_proveedor', pr.nombre_proveedor,
      'nit', pr.nit
    ) END AS proveedores,
    CASE WHEN s.id_sucursal IS NULL THEN NULL ELSE json_build_object(
      'nombre_sucursal', s.nombre_sucursal,
      'ciudad', s.ciudad
    ) END AS sucursales
  FROM productos p
  LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
  LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor
  LEFT JOIN sucursales s ON s.id_sucursal = p.id_sucursal`;

const obtenerProductoCompleto = async (id) => {
  const { rows } = await pool.query(`${SELECT_PRODUCTO} WHERE p.id_producto = $1`, [id]);
  return rows;
};

// =====================================
// OBTENER PRODUCTOS
// =====================================

const obtenerProductos = async () => {
  const { rows } = await pool.query(
    `${SELECT_PRODUCTO} WHERE p.activo = true ORDER BY p.id_producto ASC`
  );
  return rows;
};

// =====================================
// AGREGAR PRODUCTO
// =====================================

const agregarProducto = async (producto) => {
  console.log("Producto a insertar:", producto);

  const [creado] = await insertar("productos", { activo: true, ...producto });
  return obtenerProductoCompleto(creado.id_producto);
};

// =====================================
// EDITAR PRODUCTO
// =====================================

const editarProducto = async (id, producto) => {
  console.log("========== EDITAR PRODUCTO ==========");
  console.log("ID:", id);
  console.log("Datos:", producto);

  await actualizar("productos", "id_producto", id, producto);
  return obtenerProductoCompleto(id);
};

// =====================================
// ELIMINAR PRODUCTO
// =====================================

const eliminarProducto = async (id) => {
  console.log("Eliminando producto:", id);

  try {
    await pool.query("DELETE FROM productos WHERE id_producto = $1", [id]);
    return { desactivado: false };
  } catch (error) {
    // 23503 = tiene movimientos / asignaciones asociadas -> borrado lógico
    if (error.code === "23503") {
      await pool.query("UPDATE productos SET activo = false WHERE id_producto = $1", [id]);
      return { desactivado: true };
    }
    throw error;
  }
};

// =====================================
// PATCH
// =====================================

const actualizarParcialProducto = async (id, datos) => {
  console.log("========== PATCH PRODUCTO ==========");
  console.log("ID:", id);
  console.log("Datos:", datos);

  await actualizar("productos", "id_producto", id, datos);
  return obtenerProductoCompleto(id);
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
  const { rows } = await pool.query(
    "SELECT imagen FROM productos WHERE id_producto = $1",
    [id]
  );
  if (rows.length === 0) throw new Error("Producto no encontrado");
  return rows[0].imagen || null;
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
