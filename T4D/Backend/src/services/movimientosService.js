const supabase =
  require("../config/supabase");

// =====================================
// GET
// =====================================

const obtenerMovimientosService =
  async () => {

    const { data, error } =
      await supabase
        .from("movimientos_inventario")
        .select(`
          id_movimiento,
          fecha_movimiento,
          tipo_movimiento,
          cantidad,

          productos:productos!movimientos_inventario_id_producto_fkey (
            id_producto,
            nombre_producto
          ),

          usuarios:usuarios!movimientos_inventario_id_usuario_fkey (
            id_usuario,
            username
          )
        `)
        .order(
          "fecha_movimiento",
          {
            ascending: false,
          }
        );

    if (error) {
      throw error;
    }

    return data;
};

// =====================================
// POST
// =====================================

const crearMovimientoService =
  async (movimiento) => {

    const { data, error } =
      await supabase
        .from("movimientos_inventario")
        .insert([movimiento])
        .select();

    if (error) {
      throw error;
    }

    return data;
};

module.exports = {
  obtenerMovimientosService,
  crearMovimientoService,
};

// =====================================
// POST
// =====================================

const crearMovimientoService =
  async (movimiento) => {

    const { data, error } =
      await supabase
        .from("movimientos_inventario")
        .insert([movimiento])
        .select();

    if (error) {
      throw error;
    }

    return data;
};

module.exports = {
  obtenerMovimientosService,
  crearMovimientoService,
};