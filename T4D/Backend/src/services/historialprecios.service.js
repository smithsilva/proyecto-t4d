const pool = require("../config/db");
const { insertar, actualizar } = require("../utils/sql");

// =====================================
// PRODUCTOS
// =====================================

const obtenerProductos = async () => {
  const { rows } = await pool.query(
    "SELECT id_producto, nombre_producto, precio_actual, activo FROM productos ORDER BY nombre_producto ASC"
  );
  return rows;
};

// Crea un producto nuevo y registra el precio inicial en el historial
// (en una transacción: si falla el historial, no queda el producto)
const crearProducto = async ({ nombre_producto, precio_inicial, motivo }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const [producto] = await insertar(
      "productos",
      { nombre_producto, precio_actual: precio_inicial, activo: true },
      client
    );

    await insertar(
      "historial_precios",
      {
        id_producto: producto.id_producto,
        precio_anterior: 0,
        precio_nuevo: precio_inicial,
        motivo: motivo || "Creación de producto",
        fecha_cambio: new Date().toISOString(),
      },
      client
    );

    await client.query("COMMIT");
    return producto;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ERROR CREAR PRODUCTO:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Edita nombre y/o precio de un producto. Si el precio cambia, exige motivo y registra historial.
const editarProducto = async (id, { nombre_producto, precio_nuevo, motivo }) => {
  const { rows } = await pool.query(
    "SELECT id_producto, nombre_producto, precio_actual FROM productos WHERE id_producto = $1",
    [id]
  );
  const productoActual = rows[0];

  if (!productoActual) {
    const err = new Error("Producto no encontrado");
    err.status = 404;
    throw err;
  }

  const precioAnterior = Number(productoActual.precio_actual);
  const precioNumero = precio_nuevo !== undefined ? Number(precio_nuevo) : precioAnterior;
  const cambioPrecio = precio_nuevo !== undefined && precioNumero !== precioAnterior;
  const cambioNombre =
    nombre_producto !== undefined && nombre_producto !== productoActual.nombre_producto;

  if (cambioPrecio && !motivo) {
    const err = new Error("El motivo es obligatorio cuando cambia el precio");
    err.status = 400;
    throw err;
  }

  const updates = {};
  if (cambioNombre) updates.nombre_producto = nombre_producto;
  if (cambioPrecio) updates.precio_actual = precioNumero;

  if (Object.keys(updates).length === 0) {
    return productoActual;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const [productoActualizado] = await actualizar(
      "productos",
      "id_producto",
      id,
      updates,
      client
    );

    if (cambioPrecio) {
      await insertar(
        "historial_precios",
        {
          id_producto: id,
          precio_anterior: precioAnterior,
          precio_nuevo: precioNumero,
          motivo,
          fecha_cambio: new Date().toISOString(),
        },
        client
      );
    }

    await client.query("COMMIT");
    return productoActualizado;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ERROR EDITAR PRODUCTO:", error);
    throw error;
  } finally {
    client.release();
  }
};

const cambiarEstadoProducto = async (id, activo) => {
  const [producto] = await actualizar("productos", "id_producto", id, { activo });
  if (!producto) {
    const err = new Error("Producto no encontrado");
    err.status = 404;
    throw err;
  }
  return producto;
};

const eliminarProducto = async (id) => {
  try {
    await pool.query("DELETE FROM productos WHERE id_producto = $1", [id]);
    return true;
  } catch (error) {
    // Violación de llave foránea
    if (error.code === "23503") {
      const err = new Error(
        "No se puede eliminar: el producto tiene historial de precios asociado. Desactívalo en su lugar."
      );
      err.status = 409;
      throw err;
    }
    throw error;
  }
};

// =====================================
// HISTORIAL DE PRECIOS
// =====================================

const obtenerHistorial = async () => {
  const { rows } = await pool.query("SELECT * FROM historial_precios ORDER BY id_historial DESC");
  return rows;
};

const obtenerHistorialPorProducto = async (idProducto) => {
  const { rows } = await pool.query(
    "SELECT * FROM historial_precios WHERE id_producto = $1 ORDER BY id_historial DESC",
    [idProducto]
  );
  return rows;
};

const eliminarRegistroHistorial = async (id) => {
  await pool.query("DELETE FROM historial_precios WHERE id_historial = $1", [id]);
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
