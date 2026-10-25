const {
  obtenerProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto,
  actualizarParcialProducto,
  subirImagenCloudinary,
  eliminarImagenCloudinary,
  obtenerImagenProducto,
} = require("../services/productos.service");

const { crearMovimientoService } = require("../services/movimientosService");
const supabase = require("../config/supabase");

// =====================================
// Helper: trae solo el stock_actual de un producto
// =====================================
const obtenerStockActual = async (id) => {
  const { data, error } = await supabase
    .from("productos")
    .select("stock_actual")
    .eq("id_producto", id)
    .single();

  if (error) throw error;
  return data.stock_actual;
};

// =====================================
// Helper: crea el movimiento si hubo un cambio real de stock
// =====================================
const registrarMovimientoSiCambioStock = async ({
  id_producto,
  stockAnterior,
  stockNuevo,
  id_usuario,
  observacion,
}) => {
  if (stockAnterior === undefined || stockNuevo === undefined) return;
  const diferencia = Number(stockNuevo) - Number(stockAnterior);
  if (diferencia === 0) return;

  await crearMovimientoService({
    id_producto,
    id_usuario: id_usuario ?? null,
    tipo_movimiento: diferencia > 0 ? "entrada" : "salida",
    cantidad: Math.abs(diferencia),
    observacion,
  });
};

// =====================================
// Helper: si cambió la imagen, borra la anterior de Cloudinary
// =====================================
const limpiarImagenAnteriorSiCambio = async (imagenAnterior, imagenNueva) => {
  if (imagenNueva === undefined) return; // no vino el campo
  if (imagenAnterior && imagenAnterior !== imagenNueva) {
    await eliminarImagenCloudinary(imagenAnterior);
  }
};

// =====================================
// GET
// =====================================

const getProductos = async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.json(productos);
  } catch (error) {
    console.error("ERROR GET PRODUCTOS:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// POST — crea el producto y su movimiento de "stock inicial"
// =====================================

const postProducto = async (req, res) => {
  try {
    const producto = await agregarProducto(req.body);

    // agregarProducto() devuelve un array por el .select() de Supabase
    const nuevo = Array.isArray(producto) ? producto[0] : producto;

    if (nuevo?.id_producto) {
      const stockInicial = nuevo.stock_actual ?? 0;
      if (stockInicial > 0) {
        await crearMovimientoService({
          id_producto: nuevo.id_producto,
          id_usuario: req.usuario?.id_usuario ?? null,
          tipo_movimiento: "entrada",
          cantidad: stockInicial,
          observacion: "Stock inicial al crear producto",
        });
      }

      // Registro inicial en el historial de precios. Es "best effort": si
      // falla, no se revierte la creación del producto, solo se loguea,
      // porque el producto en sí ya quedó creado correctamente.
      try {
        await supabase.from("historial_precios").insert([
          {
            id_producto: nuevo.id_producto,
            precio_anterior: 0,
            precio_nuevo: nuevo.precio_actual ?? 0,
            motivo: "Creación de producto",
            fecha_cambio: new Date().toISOString(),
          },
        ]);
      } catch (errorHistorial) {
        console.error("ERROR HISTORIAL INICIAL:", errorHistorial);
      }
    }

    res.status(201).json(producto);
  } catch (error) {
    console.error("ERROR POST PRODUCTO:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// POST /imagen — sube una imagen a Cloudinary y devuelve la URL
// =====================================

const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const resultado = await subirImagenCloudinary(req.file.buffer);

    res.status(201).json({
      url: resultado.secure_url,
      public_id: resultado.public_id,
    });
  } catch (error) {
    console.error("ERROR SUBIR IMAGEN:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// =====================================
// PUT — edición completa. Si viene stock_actual, registra el movimiento.
// Si viene una imagen nueva, borra la anterior de Cloudinary.
// =====================================

const putProducto = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID recibido:", id);
    console.log("BODY recibido:", req.body);

    let stockAnterior;
    const vieneStock = req.body.stock_actual !== undefined;
    if (vieneStock) {
      stockAnterior = await obtenerStockActual(id);
    }

    let imagenAnterior = null;
    const vieneImagen = req.body.imagen !== undefined;
    if (vieneImagen) {
      imagenAnterior = await obtenerImagenProducto(id);
    }

    const producto = await editarProducto(id, req.body);

    if (vieneStock) {
      await registrarMovimientoSiCambioStock({
        id_producto: id,
        stockAnterior,
        stockNuevo: req.body.stock_actual,
        id_usuario: req.usuario?.id_usuario,
        observacion: "Ajuste de stock desde edición de producto",
      });
    }

    if (vieneImagen) {
      await limpiarImagenAnteriorSiCambio(imagenAnterior, req.body.imagen);
    }

    res.json(producto);
  } catch (error) {
    console.error("ERROR PUT PRODUCTO:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// PATCH — edición parcial. Si viene stock_actual, registra el movimiento.
// Si viene una imagen nueva, borra la anterior de Cloudinary.
// =====================================

const patchProducto = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID recibido:", id);
    console.log("BODY recibido:", req.body);

    let stockAnterior;
    const vieneStock = req.body.stock_actual !== undefined;
    if (vieneStock) {
      stockAnterior = await obtenerStockActual(id);
    }

    let imagenAnterior = null;
    const vieneImagen = req.body.imagen !== undefined;
    if (vieneImagen) {
      imagenAnterior = await obtenerImagenProducto(id);
    }

    const producto = await actualizarParcialProducto(id, req.body);

    if (vieneStock) {
      await registrarMovimientoSiCambioStock({
        id_producto: id,
        stockAnterior,
        stockNuevo: req.body.stock_actual,
        id_usuario: req.usuario?.id_usuario,
        observacion: "Ajuste de stock (PATCH)",
      });
    }

    if (vieneImagen) {
      await limpiarImagenAnteriorSiCambio(imagenAnterior, req.body.imagen);
    }

    res.json(producto);
  } catch (error) {
    console.error("ERROR PATCH PRODUCTO:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// PATCH STOCK (solo cantidad, para Admin y Mecánico)
// =====================================

const patchStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body; // el cliente Flutter envía { "stock": nuevoValor }

    console.log("ID recibido:", id);
    console.log("STOCK recibido:", stock);

    if (stock === undefined) {
      return res.status(400).json({
        error: "Debes enviar el campo 'stock'",
      });
    }

    // 1. Stock antes de tocar nada
    const stockAnterior = await obtenerStockActual(id);

    // 2. Actualizar usando el nombre real de la columna: stock_actual
    const producto = await actualizarParcialProducto(id, {
      stock_actual: stock,
    });

    // 3. Registrar el movimiento
    await registrarMovimientoSiCambioStock({
      id_producto: id,
      stockAnterior,
      stockNuevo: stock,
      id_usuario: req.usuario?.id_usuario,
      observacion: "Ajuste de stock",
    });

    res.json(producto);
  } catch (error) {
    console.error("ERROR PATCH STOCK:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

// =====================================
// DELETE — elimina el producto (o lo desactiva si tiene movimientos/asignaciones)
// =====================================

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Guardamos la URL antes de borrar el registro
    let imagen = null;
    try {
      imagen = await obtenerImagenProducto(id);
    } catch (e) {
      console.error("No se pudo leer la imagen antes de borrar:", e);
    }

    const { desactivado } = await eliminarProducto(id);

    // Solo limpiamos Cloudinary si el producto se borró de verdad
    if (imagen && !desactivado) {
      await eliminarImagenCloudinary(imagen);
    }

    res.json({
      message: desactivado
        ? "El producto tiene movimientos o asignaciones asociadas, fue desactivado"
        : "Producto eliminado",
      desactivado,
    });
  } catch (error) {
    console.error("ERROR DELETE PRODUCTO:", error);

    res.status(500).json({
      error: error.message,
      detalle: error,
    });
  }
};

module.exports = {
  getProductos,
  postProducto,
  subirImagen,
  putProducto,
  patchProducto,
  patchStock,
  deleteProducto,
};