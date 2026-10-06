const {
  obtenerProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto,
  actualizarParcialProducto,
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
// PUT — edición completa. Si viene stock_actual, registra el movimiento.
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
// DELETE
// =====================================

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    await eliminarProducto(id);

    res.json({
      message: "Producto eliminado",
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
  putProducto,
  patchProducto,
  patchStock,
  deleteProducto,
};