const supabase =
  require("../config/supabase");

const obtenerMovimientos = async (
  req,
  res
) => {

  try {

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

      return res.status(500).json({
        error: error.message,
      });

    }

    res.json(data);
    res.json({
      mensaje:
        "Lista de movimientos",
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

};

const crearMovimiento = async (
  req,
  res
) => {

  try {

    const datos = req.body;

    res.status(201).json({
      mensaje:
        "Movimiento creado correctamente",
      datos,
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

};

module.exports = {
  obtenerMovimientos,
  crearMovimiento,
};